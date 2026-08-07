import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Commit History
 *
 * Every snapshot you save becomes part of your project's history, like
 * chapters in a book. git log reads that history back, newest first.
 */
export const lessonCommitHistory: ContentLesson = {
  id: "commit-history",
  slug: "commit-history",
  title: "Commit History",
  description:
    "Every snapshot you save is a chapter in your project's story. Learn how to read that story with git log.",
  meta: {
    module: "history",
    order: 1,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["history", "log"],
    summary: [
      "Commits form your project's history.",
      "git log reads history, newest first.",
      "Each commit is one saved snapshot.",
      "History is how you understand how a project grew.",
    ],
    whyItMatters:
      "History is where Git's power lives. Before you can navigate, jump around, or recover, you need to read the story your commits tell.",
    motivation:
      "You can read your project's diary now. Next, you'll meet the marker that says where you are: HEAD.",
  },
  learningGoals: [
    "Explain what commit history is",
    "Read history with git log",
    "Understand commits as chapters",
  ],
  xpReward: 45,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "index.html": "<h1>hi</h1>\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      'echo "<h1>homepage</h1>" > index.html',
      "git add .",
      'git commit -m "Add homepage"',
    ],
    objectives: [
      {
        id: "new-chapter",
        label: "Add a new chapter to the diary",
        checks: [{ kind: "latestCommitMessage", message: "Add login" }],
      },
      {
        id: "read-log",
        label: "Read the whole story with git log",
        checks: [{ kind: "commitCountAtLeast", count: 3 }],
      },
      {
        id: "newest",
        label: "Confirm the newest chapter comes first",
        checks: [{ kind: "latestCommitMessage", message: "Add login" }],
      },
    ],
    hints: [
      "Add a new file, like login.js, then commit it with message 'Add login'.",
      "Run git log to see your history, newest first.",
      "Run git log --oneline for the compact one-line view.",
    ],
    solution: ["touch login.js", "git add .", 'git commit -m "Add login"', "git log --oneline"],
    suggestions: ["touch login.js", "git add .", "git log --oneline"],
    visualizer: { highlight: "head", banner: "Every commit is a chapter. git log reads them, newest first" },
    shell: {
      primaryCommand: "git log --oneline",
      placeholder: "git log",
      quickActions: ["git log --oneline", "git log"],
      welcomeText: "Read your project's diary.",
      helperText: "This repo has three commits. Read them with git log, newest first.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll read your project's history like a story, and know what each chapter means.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You've been saving snapshots as you work. What happens to all those snapshots? They stack up into your project's history, like chapters in a book.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "A diary that writes itself",
      text: "Think of every commit as a diary entry. Each one records what you did and when. Open the diary and you see the whole story of your project, from today back to day one.",
    },

    // ---------------------------------------------------------------
    // 1 · The history timeline.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-timeline",
      level: 2,
      text: "Snapshots in a line",
    },
    {
      type: "paragraph",
      id: "timeline-question",
      text: "Each dot below is one commit. Together they form a line that tells your project's story.",
    },
    {
      type: "gitGraph",
      id: "visual-history",
      title: "Your project's diary",
      width: 340,
      height: 70,
      commits: [
        { id: "c1", x: 30, y: 24, lane: 0, message: "Start project" },
        { id: "c2", x: 130, y: 24, lane: 0, message: "Add homepage" },
        { id: "c3", x: 230, y: 24, lane: 0, message: "Add login", accent: true },
      ],
      lines: [
        {
          id: "timeline",
          points: [
            { x: 30, y: 24 },
            { x: 130, y: 24 },
            { x: 230, y: 24 },
          ],
        },
      ],
    },
    {
      type: "callout",
      id: "timeline-connect",
      tone: "success",
      title: "Newest first",
      text: "When you read your history, the newest commit comes first. The most recent chapter is at the top, and each older one sits below it.",
    },

    // ---------------------------------------------------------------
    // 2 · Read it with git log.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-log",
      level: 2,
      text: "Read the diary",
    },
    {
      type: "paragraph",
      id: "log-question",
      text: "git log prints your history, newest commit first. Each entry shows the commit's hash, author, date, and message.",
    },
    {
      type: "terminalSteps",
      id: "terminal-log",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "index.html": "<h1>hi</h1>\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git log --oneline",
          output: "79048ff (HEAD -> main) Add login\n3f2ab71 Add homepage\na1b2c3d Start project",
          outputKind: "output",
          note: "One line per commit, newest first. The hash and message tell you what each one was.",
        },
      ],
    },
    {
      type: "callout",
      id: "log-connect",
      tone: "success",
      title: "Reading a line",
      text: "The short code on the left is the commit's hash, its ID card. The message on the right is the chapter's title. Together they tell the whole story.",
    },

    // ---------------------------------------------------------------
    // 3 · Common mistake.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-mistake",
      level: 2,
      text: "Common beginner mistake",
    },
    {
      type: "warning",
      id: "mistake-warning",
      title: "Thinking log shows your files",
      text: "git log shows commits, not file contents. It's the diary, not the pages. To see what changed inside a commit, you'll use git show, coming up soon.",
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
        "Your history has three commits. Which one does git log show first, and why?",
      hint: "Newest or oldest?",
      exampleAnswer:
        "git log shows the newest commit first, because I usually want to know the latest thing that happened. Each older commit follows below it.",
    },

    // ---------------------------------------------------------------
    // 5 · What to remember.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-takeaways",
      level: 2,
      text: "What to remember",
    },
    {
      type: "tip",
      id: "tip-history",
      title: "Quick tip",
      text: "Run git log --oneline for a fast, one-line-per-commit view. It's the version everyone uses every day.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "Commits form your project's history.",
        "git log reads history, newest first.",
        "Each line is one saved snapshot.",
        "The hash is a commit's ID card.",
        "History is your project's story.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can read your project's diary now. Next, meet the marker that says where you are in it: HEAD.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: HEAD",
      text: "Learn about the little pointer that marks your current spot in history.",
    },
  ],
};
