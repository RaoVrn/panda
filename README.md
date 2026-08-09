# Panda

Panda is a visual, interactive platform for learning Git, GitHub and version
control. It combines a guided curriculum with a simulated Git terminal and a
hands-on playground, backed by a built-in AI mentor.

## What Panda teaches

A single course, six modules, 45 lessons:

1. **Git Fundamentals** — what Git is, repositories, the working tree and staging area.
2. **Core Commands** — `git status`, `add`, `commit`, `log`, `diff`, `restore`, `rm`, `mv`, `.gitignore`.
3. **History** — reading and inspecting history: `log`, `show`, `blame`, `reflog`, detached HEAD.
4. **Branching** — branches, `switch`, `checkout`, merging, fast-forward merges.
5. **Remote Repositories** — `remote`, `clone`, `fetch`, `pull`, `push`, GitHub.
6. **Advanced Git** — `stash`, `cherry-pick`, `reset`, `revert`, `rebase`, squashing, tags.

Every lesson pairs a short, beginner-friendly explanation with a live terminal
demonstration and an interactive playground. The Git simulator intentionally
covers a practical subset of real Git (for example, pull is fast-forward only
and merge conflicts are not simulated); lessons call out these differences.

## Getting started

Requires Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`). Without configuration
the app runs in anonymous mode: you can browse and study with progress saved
to your device.

## Environment variables

Copy `.env.example` to `.env` and fill in what you need. All variables are
optional — the app degrades gracefully when they are missing.

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — user accounts and cloud
  progress sync. When unset, the app runs in anonymous/device-local mode.
- `VITE_AI_PROVIDER`, `VITE_GROQ_MODEL`, `VITE_GROQ_FALLBACK_MODELS` — AI
  provider and model selection (client-side, non-sensitive).
- `VITE_AI_TIMEOUT`, `VITE_AI_MAX_RETRIES`, `VITE_AI_MAX_TOTAL_MS`,
  `VITE_AI_CACHE_TTL` — AI request tuning.

## AI configuration

Panda AI calls Groq through a thin server-side proxy: a Supabase Edge Function
at `supabase/functions/ai-chat`. The Groq API key is **server-side only** and
must never be exposed to the browser:

1. Set the Groq key as a Supabase Edge Function secret (never with a `VITE_`
   prefix, which would embed it in the client bundle):

   ```bash
   supabase secrets set GROQ_API_KEY=gsk_...
   ```

2. Deploy the function:

   ```bash
   supabase functions deploy ai-chat
   ```

The Edge Function verifies the caller is a signed-in Panda user (Supabase JWT),
forwards the prompt to Groq, and streams the reply back. The client never sees
or sends the key. Without Supabase configured, Panda AI shows a setup notice
and the rest of the app keeps working.


## Development

```bash
npm run dev          # local dev server
npm run lint         # ESLint
npm run lint:fix     # ESLint with autofix
npm run format       # Prettier
npm run format:check # Prettier check
npm test             # Vitest unit + engine tests
npm run build        # typecheck (tsc -b) then production build
npm run preview      # preview the production build
```

## Project structure

- `src/content/` — the curriculum and all lesson content (typed data blocks).
- `src/lib/git/` — the playground Git simulator (command engine + repository model).
- `src/features/lesson/components/interactive/gitEngine.ts` — the terminal simulator.
- `src/features/playground/` — the interactive mission workspace.
- `src/features/ai/` — the Panda AI mentor (context, chat, providers).

## License

Panda is released under the [MIT License](LICENSE). Copyright (c) 2026
Varun Prakash.
