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
    "The moment your work becomes permanent history. Learn to commit well, and write messages that future-you will love.",
  meta: {
    module: "core-commands",
    order: 4,
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
      "Commits are the heartbeats of your project. You've mastered them. Next, reading the full story with git log.",
  },
  learningGoals: [
    "Commit with a clear message",
    "Read the parts of a commit",
    "Write messages that describe intent",
  ],
  xpReward: 50,
    playground: {
      "seed": {
        "files": {
          "index.html": "<h1>hi</h1>\n"
        },
        "pwd": "~/project",
        "initialized": true
      },
      "objectives": [
        {
          "id": "stage",
          "label": "Stage a file",
          "checks": [
            {
              "kind": "fileStaged",
              "path": "index.html"
            }
          ]
        },
        {
          "id": "commit",
          "label": "Commit it with a clear message",
          "checks": [
            {
              "kind": "commitCountAtLeast",
              "count": 1
            }
          ]
        },
        {
          "id": "history",
          "label": "See it in your history",
          "checks": [
            {
              "kind": "commitTouchesFile",
              "path": "index.html"
            }
          ]
        }
      ],
      "hints": [
        "Choose what goes in the snapshot: git add index.html.",
        "Take the picture: git commit -m \"\u2026\" \u2014 say what you did in one clear line.",
        "Read your diary back: git log (or git log --oneline)."
      ],
      "solution": [
        "git add index.html",
        "git commit -m \"Add landing page\"",
        "git log"
      ],
      "suggestions": [
        "git commit -m \"\"",
        "git log",
        "git log --oneline",
        "git status"
      ],
      "visualizer": {
        "highlight": "repository",
        "banner": "Take the snapshot \u2014 make it permanent"
      },
      "shell": {
        "primaryCommand": "git commit",
        "placeholder": "git commit -m \"\"",
        "quickActions": [
          "git commit -m",
          "git status",
          "git log"
        ],
        "welcomeText": "Make your work permanent.",
        "helperText": "A commit is a time capsule: a snapshot, an ID, your name, and a message. Write a good one."
      }
    },

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
      text: "Describe the change in the present tense, like an order: \"Add …\", \"Fix …\", \"Update …\". If you can't fit it in one line, your commit might be doing too much. Split it.",
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
      text: "There's no rule about how often to commit. Some people commit every few minutes. Small snapshots are easier to understand and easier to undo. Never save for the end of the day.",
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
        "Write a commit message for: you fixed the search box crashing on empty pages.",
      hint: "Present tense, one line, what + why.",
      exampleAnswer:
        'git commit -m "Fix search crash when there is no content" says what changed and why, in one clear line.',
    },

    // ---------------------------------------------------------------

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
      type: "tip",
      id: "tip-git-commit",
      title: "Quick tip",
      text: "Commit small and often. A tiny, clear snapshot beats a giant messy one every time.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "A commit = snapshot + ID + your name + a message.",
        "The message tells future-you what happened.",
        "Write present-tense, one-line messages.",
        "One idea per commit keeps history clean.",
        "Commit often. Never wait till the end of the day.",
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
      text: "See your whole project history as a readable timeline, and learn the --oneline trick everyone uses.",
    },
  ],
};
