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
  /** The lesson location that produced an assistant answer. */
  source?: AiSource;
  /** Context sources the assistant used, shown as badges above the answer. */
  badges?: string[];
  /** Epoch ms, for stable ordering when persisting conversations. */
  createdAt?: number;
}

export interface AiSource {
  course?: string;
  module?: string;
  lesson?: string;
  section?: string;
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
 *
 * `ContextCollector` enriches the live reports with the static curriculum
 * (course/module) and the learner's progress, so every turn knows the full
 * picture: Git › Git Basics › git add › "Stage like a pro" › working-tree viz.
 */
export interface LessonContext {
  /** Id of the lesson currently open (lets the service resolve the rest). */
  lessonId?: string;
  /** Slug used by the route, kept explicit for navigation and cache safety. */
  lessonSlug?: string;
  /** Human title of the course (e.g. "Learn Git"). */
  course?: string;
  /** Title of the module (section of the course) this lesson belongs to. */
  module?: string;
  /** Human title of the current lesson. */
  lessonTitle?: string;
  /** Text of the section heading currently on screen. */
  currentSection?: string;
  /** Current level-2 heading. */
  currentHeading?: string;
  /** Current level-3 subheading. */
  currentSubheading?: string;
  /** read | interactive. */
  mode?: string;
  /** The lesson's stated learning goals, if any. */
  learningGoals?: string[];
  /** Description of the visualization currently on screen. */
  visualization?: string;
  /** The last command shown/typed in the terminal sandbox. */
  terminal?: string;
  /** The learner's current playground objective (the one they're working on). */
  objective?: string;
  /** Compact mission progress, e.g. "2 of 3 objectives done". */
  missionProgress?: string;
  /** What the learner is currently editing / the last saved snapshot. */
  editor?: string;
  /** Current sandbox/editor contents, capped for prompt safety. */
  sandbox?: string;
  /** The commit currently selected in the timeline. */
  gitGraph?: string;
  /** The quiz question currently on screen, and whether it was answered. */
  quiz?: string;
  /** The practice challenge currently on screen, and whether it was answered. */
  practice?: string;
  /** Learner's progress through the current lesson (e.g. "40% read"). */
  lessonProgress?: string;
  /** Quiz state for the current lesson (attempted / passed / score). */
  quizProgress?: string;
  /** What the learner is currently looking at (block label, e.g. "Staging area"). */
  currentBlock?: string;
  /** Stable block id currently in front of the learner. */
  currentBlockId?: string;
  /** Schema block type currently in front of the learner. */
  currentBlockType?: string;
  /** Short source text for the active block. */
  currentBlockText?: string;
  /** 0–100 scroll progress through the lesson. */
  scrollPercent?: number;
  /** Text/code the learner currently has highlighted on screen. */
  selectedText?: string;
  /** Compact summary of the live terminal/git state. */
  terminalState?: string;
  /** The section currently in view, plus its nearby headings. */
  pageOutline?: string;
  /** The text of the section currently in view (capped). */
  currentSectionText?: string;
  /** How long (seconds) the learner has been on the current section. */
  timeOnSectionSeconds?: number;
  /** Compact learning-memory summary (topics asked, struggles). */
  memory?: string;
  /** Lesson difficulty (for adaptive depth). */
  difficulty?: string;
  /** Whether this context is tied to an authored lesson. */
  contextReady?: boolean;
  /** Course progress facts used by navigation questions. */
  completedLessons?: string;
  recommendedNext?: string;
  unlockedLessons?: string;
  /** Learner's current gamification state. */
  xp?: number;
  level?: number;
  /* App-wide facts used by the global assistant (no lesson open). */
  /** "5 of 30 unlocked: First Lesson, Core Commands, ..." */
  achievementsSummary?: string;
  /** Course + module overview, e.g. "Learn Git: 6 modules, 45 lessons". */
  courseOverview?: string;
  /** Modules fully completed, as titles. */
  modulesCompleted?: string;
  /** Current daily streak in days. */
  streakDays?: number;
  /** Display name of the signed-in user. */
  userName?: string;
  /** Email of the signed-in user. */
  userEmail?: string;
  /** Slugs of lessons the learner has completed (for Review/Learn labels). */
  completedLessonSlugs?: string;
  /** The route the assistant was opened from, e.g. "/lesson/git-rebase". */
  currentRoute?: string;
  /** Available action destinations, documented for the AI's tool use. */
  aiTools?: string;
  /* ------------------------------------------------------------ */
  /* Structured lesson data  -  the single source of truth. These are   */
  /* built from the authored lesson (never scraped from the DOM).      */
  /* ------------------------------------------------------------ */
  /** Lesson description (what it's about). */
  description?: string;
  /** Learning objectives. */
  objectives?: string[];
  /** Section headings, in order. */
  headings?: string[];
  /** Subheadings. */
  subheadings?: string[];
  /** Concepts/ideas taught (from goals, callouts, takeaways). */
  concepts?: string[];
  /** Commands demonstrated in the lesson. */
  commands?: string[];
  /** Code/editor examples. */
  examples?: string[];
  /** Callouts / tips / warnings. */
  callouts?: string[];
  /** Key takeaways. */
  takeaways?: string[];
  /** Compact quiz summary (questions). */
  quizSummary?: string;
  /** The practice challenge prompt. */
  challenge?: string;
  /** Interactive block types present in the lesson. */
  interactiveComponents?: string[];
  /** Estimated reading time in minutes. */
  estimatedMinutes?: number;
  /** The learner's preferred explanation depth (from settings). */
  explanationStyle?: "simple" | "balanced" | "deep";
  /** Theme preference (settings). */
  theme?: string;
  /** Default lesson mode (settings). */
  lessonMode?: string;
  /** Animation speed (settings). */
  animationSpeed?: string;
  /** Completed/total lesson counts. */
  completedCount?: number;
  totalCount?: number;
  /** The structured block currently in front of the learner. */
  visibleBlock?: {
    type: string;
    label: string;
    text?: string;
    code?: string;
    language?: string;
    filename?: string;
    commands?: string[];
    note?: string;
  };
  /** Code contents when the visible block is code/editor. */
  visibleCode?: { code?: string; language?: string; filename?: string };
  /** The last terminal command when a terminal block is visible. */
  visibleCommand?: string;
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
