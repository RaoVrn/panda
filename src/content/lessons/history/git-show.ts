import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git show
 *
 * git show opens one commit and shows what's inside it: the author, the
 * message, and the files it changed. It's like opening a saved snapshot
 * and reading its label.
 */
export const lessonGitShow: ContentLesson = {
  id: "git-show",
  slug: "git-show",
  title: "git show",
  description:
    "git show opens a single commit and shows what changed. It's how you peek inside a snapshot to see what it holds.",
  meta: {
    module: "history",
    order: 4,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["history", "show"],
    summary: [
      "git show inspects one commit.",
      "It shows the author, date, and message.",
      "It lists the files that changed.",
      "It's the way to look inside a snapshot.",
    ],
    whyItMatters:
      "git log tells you history exists. git show tells you what a single snapshot actually changed, which is how you understand any commit.",
    motivation:
      "You can inspect commits now. Next, you'll find who changed each line with git blame.",
  },
  learningGoals: [
    "Open a commit with git show",
    "Read the author, date, and message",
    "See which files changed",
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
      'echo "<h1>home</h1>" > index.html',
      "git add .",
      'git commit -m "Add homepage"',
    ],
    objectives: [
      {
        id: "inspect",
        label: "Make a commit, then inspect it with git show",
        checks: [{ kind: "latestCommitMessage", message: "Add profile" }],
      },
    ],
    hints: [
      "Add a file or change, then commit it: git add . then git commit -m \"Add profile\"",
      "Run git show to open your newest commit and read what changed.",
      "The output shows the author, the date, the message, and the files.",
    ],
    solution: [
      "touch profile.js",
      "git add .",
      'git commit -m "Add profile"',
      "git show",
    ],
    suggestions: ["touch profile.js", "git add .", "git show"],
    visualizer: { highlight: "head", banner: "git show opens a snapshot and shows what changed" },
    shell: {
      primaryCommand: "git show",
      placeholder: "git show",
      quickActions: ["git show", "git add .", "git log --oneline"],
      welcomeText: "Open a snapshot.",
      helperText: "Make a commit, then run git show to see exactly what it changed.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll open any saved snapshot and read exactly what it changed.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You have a box of old photo albums. On the outside you can read the year. To see what's inside, you open one. git show is opening one.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Reading the album label",
      text: "A commit is like an album. git show opens it and shows the label: who took the snapshot, when, what they wrote, and which photos (files) are inside.",
    },

    // ---------------------------------------------------------------
    // 1 · Open a commit.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-show",
      level: 2,
      text: "Open a commit",
    },
    {
      type: "paragraph",
      id: "show-question",
      text: "Run git show with a commit's hash, and Git opens that snapshot for you.",
    },
    {
      type: "terminalSteps",
      id: "terminal-show",
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
          command: "git show 79048ff",
          output: "commit 79048ff\nAuthor: Panda <panda@example.com>\nDate:   Aug 08, 02:37 AM\n\n    Add login\n\n A  login.js",
          outputKind: "output",
          note: "The author, the date, the message, and the file that changed.",
        },
      ],
    },
    {
      type: "callout",
      id: "show-connect",
      tone: "success",
      title: "Reading the label",
      text: "The top tells you who and when. The message explains what. The A in \"A login.js\" means the file was added in this snapshot. That's the whole story of one commit.",
    },

    // ---------------------------------------------------------------
    // 2 · Without a hash.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-head",
      level: 2,
      text: "Show the newest commit",
    },
    {
      type: "paragraph",
      id: "head-question",
      text: "Don't remember any hash? Run git show with no hash and Git opens your newest commit, the one HEAD points to.",
    },
    {
      type: "callout",
      id: "head-connect",
      tone: "success",
      title: "HEAD is the default",
      text: "git show all by itself means \"show me where I am right now\". It's a handy shortcut when you just committed and want to check what you did.",
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
      title: "Typing a wrong hash",
      text: "Hashes are long and easy to mistype. You only need the first 7 characters. And you can copy one straight from git log --oneline, so you never have to memorize it.",
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
        "You want to see what your newest commit changed. What command shows it without needing a hash?",
      hint: "HEAD points at your newest commit.",
      exampleAnswer:
        "I'd run git show by itself. With no hash, it opens the commit HEAD points at, which is my newest one. It shows what changed.",
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
      id: "tip-show",
      title: "Quick tip",
      text: "Copy a hash from git log --oneline, then run git show <hash>. Two commands that let you read any chapter of your history.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git show opens one commit.",
        "It shows author, date, and message.",
        "It lists the files that changed.",
        "git show alone opens your newest commit.",
        "Copy hashes from git log, never memorize them.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can look inside any snapshot now. Next, find out who changed each line with git blame.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git blame",
      text: "Learn how to trace a line back to the person who wrote it.",
    },
  ],
};
