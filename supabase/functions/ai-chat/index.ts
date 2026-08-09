/**
 * ai-chat  -  server-side Groq proxy for Panda AI.
 *
 * The Groq API key lives ONLY here (as the `GROQ_API_KEY` Edge Function
 * secret). The browser never sees or sends it. This function:
 *
 *   1. verifies the caller is an authenticated Panda user (Supabase JWT),
 *   2. validates the request body (size + shape limits),
 *   3. forwards the prompt to Groq and streams the reply back,
 *   4. returns safe HTTP errors - never the API key, never raw credentials.
 *
 * Deploy with:
 *   supabase secrets set GROQ_API_KEY=<key>
 *   supabase functions deploy ai-chat
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import Groq from "npm:groq-sdk@^1.5.0";
import {
  buildGroqMessages,
  classifyGroqFailure,
  CORS_HEADERS,
  CORS_PREFLIGHT_STATUS,
  validateRequestBody,
} from "./core.ts";

function json(body: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...extra },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    // Preflight must NOT be 204 with a body. Use 200 + a tiny body (the
    // Supabase-documented pattern) so CORS headers are returned safely.
    return new Response("ok", {
      status: CORS_PREFLIGHT_STATUS,
      headers: CORS_HEADERS,
    });
  }
  if (req.method !== "POST") {
    return json({ error: { message: "Method not allowed." } }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const groqApiKey = Deno.env.get("GROQ_API_KEY");

  try {
    // 1. Authenticate: require a valid Panda user JWT (abuse control - never
    //    an unrestricted public proxy).
    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: { message: "AI is not configured." } }, 503);
    }
    const auth = req.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return json({ error: { message: "Authentication required." } }, 401);
    }
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: { message: "Authentication required." } }, 401);
    }

    // 2. Validate the request body (shape + size limits).
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json({ error: { message: "Malformed request body." } }, 400);
    }
    const validation = validateRequestBody(raw);
    if (!validation.ok) {
      return json({ error: { message: validation.message } }, validation.status);
    }
    const body = validation.data;

    // 3. Forward to Groq (the key never leaves this process).
    if (!groqApiKey) {
      return json({ error: { message: "AI is not configured on the server." } }, 503);
    }
    const client = new Groq({ apiKey: groqApiKey });
    const messages = buildGroqMessages(body);
    const stream = await client.chat.completions.create({
      model: body.model,
      messages: messages as Parameters<typeof client.chat.completions.create>[0]["messages"],
      stream: true,
    });

    // 4. Stream Groq's tokens back to the browser as SSE.
    const encoder = new TextEncoder();
    const streamBody = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content;
            if (token) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          controller.error(error);
        } finally {
          try {
            controller.close();
          } catch {
            // Already closed by the reader.
          }
        }
      },
    });

    return new Response(streamBody, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    // Never leak the Groq key or raw vendor details to the client.
    const status = error && typeof error === "object" && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
    const message = error instanceof Error ? error.message : "";
    const mapped = classifyGroqFailure(status, message);
    return json({ error: { message: mapped.message } }, mapped.status);
  }
});
