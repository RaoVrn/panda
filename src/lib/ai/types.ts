/**
 * Panda AI shared types.
 *
 * `lib/` stays framework-agnostic: nothing in here imports React. The chat
 * store lives in `stores/aiChatStore.ts`, the lesson-context store in
 * `stores/aiContextStore.ts`, and the React chat UI in the learning feature.
 */

export type AiRole = "user" | "assistant";

/** One message in the visible chat session. */
export interface ChatMessage {
  id: string;
  role: AiRole;
  text: string;
  /** True when a request failed and the message is an error notice. */
  error?: boolean;
  /** True while the model is still streaming a reply. */
  streaming?: boolean;
}

/**
 * A single special-action chip shown above every Panda AI reply. Clicking one
 * regenerates the answer for the current question in that style.
 */
export type StyleAction =
  | "simpler"
  | "visual"
  | "example"
  | "challenge"
  | "interview"
  | "replay";

/**
 * The automatic context Panda AI injects into every prompt. Components in the
 * lesson tree push slices of this in (via `stores/aiContextStore.ts`) so the
 * learner never has to repeat where they are or what they're looking at.
 */
export interface LessonContext {
  /** Human title of the current lesson. */
  lessonTitle?: string;
  /** Title of the module (section of the course) this lesson belongs to. */
  module?: string;
  /** Text of the section heading currently on screen. */
  currentSection?: string;
  /** read | interactive. */
  mode?: string;
  /** The lesson's stated learning goals, if any. */
  learningGoals?: string[];
  /** Description of the visualization currently on screen. */
  visualization?: string;
  /** The last command shown/typed in the terminal sandbox. */
  terminal?: string;
  /** What the learner is currently editing / the last saved snapshot. */
  editor?: string;
  /** The commit currently selected in the timeline. */
  gitGraph?: string;
  /** The quiz question currently on screen, and whether it was answered. */
  quiz?: string;
  /** The practice challenge currently on screen, and whether it was answered. */
  practice?: string;
}

export type PartialLessonContext = Partial<LessonContext>;

/* ------------------------------------------------------------------ */
/* Provider contract                                                   */
/* ------------------------------------------------------------------ */

/** A single turn handed to a provider. */
export interface AIRequest {
  /** Unique id for this logical request (stable across retries/fallbacks). */
  requestId: string;
  systemPrompt: string;
  history: AIMessage[];
  prompt: string;
}

/**
 * Progress hints surfaced to the UI while a request is running.
 */
export type AiProgressStatus =
  | "thinking"
  | "waiting"
  | "switching"
  | "almost-there";

export interface AIStreamCallbacks {
  /** Delivers the full accumulated text so far (streaming friendly). */
  onToken: (fullText: string) => void;
  /** Optional progress hint for the UI. */
  onStatus?: (status: AiProgressStatus) => void;
  /** Shared abort signal (deadline). */
  signal?: AbortSignal;
  /** Reports each retry attempt index (0-based), for logging or telemetry. */
  onAttempt?: (attempt: number) => void;
}

/**
 * A model provider. Implementations talk to one vendor (Groq today; OpenAI,
 * Claude, OpenRouter plug in later). They must throw typed errors from
 * `errors.ts`, never raw vendor exceptions, and must honour `signal` so
 * requests can be aborted.
 */
export interface AIProvider {
  readonly name: string;
  /** Models this provider supports, in priority order. */
  readonly models: string[];
  /** Whether the provider has enough config to run (e.g. an API key). */
  isConfigured(): boolean;
  /**
   * Advisory availability of a specific model: `true`/`false` when known,
   * `undefined` while unknown. Lets the router skip known-dead models before
   * hitting the API (the source of 404s).
   */
  isModelAvailable?(model: string): boolean | undefined;
  stream(request: AIRequest, model: string, callbacks: AIStreamCallbacks): Promise<string>;
}

/* ------------------------------------------------------------------ */
/* Conversation shapes                                                 */
/* ------------------------------------------------------------------ */

/** A provider-neutral chat message (system prompts are passed separately). */
export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}
