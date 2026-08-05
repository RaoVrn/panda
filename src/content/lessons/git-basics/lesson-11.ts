import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 11 · git commit
 *
 * The snapshot command. Covers commit anatomy (hash, author, message), writing
 * messages future-you can read, and the golden rule: one idea per commit.
 */
export const lesson11: ContentLesson = {
  id: "git-commit",
  slug: "git-commit",
  title: "git commit",
  description:
    "The moment your work becomes permanent history. Learn to commit well — and write messages that future-you will love.",
  meta: {
    module: "git-basics",
    order: 6,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics", "commit"],
    summary: [
      "git commit snapshots the staging area.",
      "Every commit has a hash, author, date and message.",
      "The message tells future-you what happened.",
      "One idea per commit keeps history readable.",
    ],
    whyItMatters:
      "Your commit messages become your project's table of contents. Good ones save you hours of detective work; vague ones leave you guessing.",
    motivation:
      "Commits are the heartbeats of your project. You've mastered them — next, reading the full story with git log.",
  },
  learningGoals: [
    "Commit with a clear message",
    "Read the parts of a commit",
    "Write messages that describe intent",
  ],
  xpReward: 50,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll commit with the confidence of someone who knows exactly what they're leaving behind for future-you.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Think of a commit as a time capsule. Inside: the snapshot, who made it, when, and a note explaining what happened. That note is the message.",
    },
    {
      type: "callout",
      id: "commit-story",
      tone: "info",
      title: "A time capsule, not a dumpster",
      text: "The difference between a helpful capsule and a junk drawer is the note. \"Added cart page\" tells future-you exactly what this snapshot contains. \"stuff\" tells them nothing.",
    },

    // ---------------------------------------------------------------
    // 1 · Anatomy of a commit.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-anatomy",
      level: 2,
      text: "Anatomy of a commit",
    },
    {
      type: "paragraph",
      id: "anatomy-question",
      text: "Commit, then read what Git wrote back. Every commit carries four things you'll learn to recognize.",
    },
    {
      type: "terminalSteps",
      id: "terminal-commit",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "index.html": "<h1>hi</h1>\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add index.html",
          output: "index.html is now staged and ready for its snapshot.",
          outputKind: "success",
        },
        {
          command: 'git commit -m "Add landing page"',
          output: '[main (root-commit) 9c2d1a7] Add landing page\n 1 file changed',
          outputKind: "success",
          note: "main = branch, 9c2d1a7 = this snapshot's ID, and the message is on the right.",
        },
        {
          command: "git log",
          output: "commit 9c2d1a7f3e8b4c9d0a1f2e3d4c5b6a7f8e9d0c1b\n    Add landing page",
          outputKind: "output",
          note: "git log reads your history back. That ID is how you'll refer to this snapshot forever.",
        },
      ],
    },
    {
      type: "callout",
      id: "anatomy-connect",
      tone: "success",
      title: "The four parts",
      text: "A commit = a snapshot (your files), an ID (the hash), a signature (you), and a note (the message). When you read history later, you'll mainly read the messages.",
    },

    // ---------------------------------------------------------------
    // 2 · Writing good messages.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-message",
      level: 2,
      text: "Write messages you'll thank yourself for",
    },
    {
      type: "paragraph",
      id: "message-question",
      text: "Good messages say what changed and why, in one short line. Read these out loud and feel the difference.",
    },
    {
      type: "code",
      id: "message-code",
      language: "text",
      filename: "the bad",
      code: 'git commit -m "stuff"',
    },
    {
      type: "code",
      id: "message-code-good",
      language: "text",
      filename: "the good",
      code: 'git commit -m "Add user login so people can save their progress"',
    },
    {
      type: "callout",
      id: "message-connect",
      tone: "success",
      title: "The one-line rule",
      text: "Describe the change in the present tense, like an order: \"Add …\", \"Fix …\", \"Update …\". If you can't fit it in one line, your commit might be doing too much — split it.",
    },

    // ---------------------------------------------------------------
    // 3 · One idea per commit.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-oneidea",
      level: 2,
      text: "One idea per commit",
    },
    {
      type: "paragraph",
      id: "oneidea-question",
      text: "The golden habit you met in the staging lesson: build each snapshot around one idea. If you fixed a bug and redesigned a page in the same afternoon, that's two commits.",
    },
    {
      type: "warning",
      id: "oneidea-warning",
      title: "Commit early, commit often",
      text: "There's no rule about how often to commit — some people commit every few minutes. Small snapshots are easier to understand and easier to undo. Never save for the end of the day.",
    },

    // ---------------------------------------------------------------
    // 4 · Mini challenge.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-challenge",
      level: 2,
      text: "Mini challenge",
    },
    {
      type: "practice",
      id: "practice-mission",
      description:
        "Write a good commit message for this change: you fixed a bug where the search box crashed when the page was empty.",
      hint: "Present tense, one line, what + why.",
      exampleAnswer:
        'git commit -m "Fix search crash when there is no content" — it says what changed and why, in one clear line.',
    },

    // ---------------------------------------------------------------
    // 5 · Quick check.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-quiz",
      level: 2,
      text: "Quick check",
    },
    {
      type: "quiz",
      id: "quiz-1",
      quiz: {
        id: "quiz-git-commit",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "What does git commit do?",
            options: [
              "Snapshots the staging area permanently",
              "Stages files",
              "Deletes history",
              "Opens a browser",
            ],
            correctIndex: 0,
            explanation: "A commit turns whatever is staged into permanent history.",
          },
          {
            id: "q2",
            prompt: "Which of these is a good commit message?",
            options: [
              "Add user login so people can save progress",
              "stuff",
              "asdf",
              "WIP",
            ],
            correctIndex: 0,
            explanation: "Good messages say what changed and why, in one clear line.",
          },
          {
            id: "q3",
            prompt: "The commit hash is…",
            options: [
              "This snapshot's unique ID",
              "Your password",
              "The file size",
              "The date",
            ],
            correctIndex: 0,
            explanation: "The hash is how Git names each snapshot so you can point at it.",
          },
          {
            id: "q4",
            prompt: "When should you commit?",
            options: [
              "Often, in small one-idea chunks",
              "Never",
              "Only once a month",
              "Only at night",
            ],
            correctIndex: 0,
            explanation: "Small, frequent commits make history readable and safe to navigate.",
          },
        ],
      },
    },

    // ---------------------------------------------------------------
    // 6 · Takeaways.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-takeaways",
      level: 2,
      text: "What to remember",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "A commit = snapshot + ID + your name + a message.",
        "The message tells future-you what happened.",
        "Write present-tense, one-line messages.",
        "One idea per commit keeps history clean.",
        "Commit often — never wait till the end of the day.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Your history is growing. Now the command that reads it back like a story: git log.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git log",
      text: "See your whole project history as a readable timeline — and learn the --oneline trick everyone uses.",
    },
  ],
};
