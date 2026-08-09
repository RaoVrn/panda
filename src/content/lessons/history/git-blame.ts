import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git blame
 *
 * git blame shows which commit last changed a file, and when. Despite
 * the name, it's not about blaming anyone. It's about understanding a file's
 * story line by line.
 */
export const lessonGitBlame: ContentLesson = {
  id: "git-blame",
  slug: "git-blame",
  title: "git blame",
  description:
    "git blame shows which commit last changed a file and when. It's not about blaming anyone. It's how you understand why a file looks the way it does.",
  meta: {
    module: "history",
    order: 5,
    difficulty: "intermediate",
    durationMinutes: 8,
    tags: ["history", "blame"],
    summary: [
      "git blame shows which commit last changed a file.",
      "It also shows when that commit was made.",
      "It's for understanding, not blaming.",
      "Great for tracing a mysterious line.",
    ],
    whyItMatters:
      "Every line of code has a story. git blame tells you which commit last touched it and when, so you can ask the right questions and understand the file.",
    motivation:
      "You can trace any line back to its last change now. Next, Git's safety net for recovering lost work: git reflog.",
  },
  learningGoals: [
    "Run git blame on a file",
    "See which commit last changed a file",
    "Understand it's for tracing, not blaming",
  ],
  xpReward: 50,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "app.js": "console.log('hi');\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
    ],
    objectives: [
      {
        id: "commit-change",
        label: "Add a line to app.js and commit it",
        checks: [{ kind: "latestCommitMessage", message: "Add welcome line" }],
      },
      {
        id: "blame",
        label: "Trace who changed the file with git blame",
        checks: [{ kind: "ranCommand", contains: "git blame" }],
      },
    ],
    hints: [
      "Add a line to app.js, for example: echo 'const user = getName();' >> app.js",
      "Stage and commit it: git add . then git commit -m \"Add welcome line\"",
      "Then run git blame app.js to see which commit last changed it, and when.",
    ],
    solution: [
      "echo 'const user = getName();' >> app.js",
      "git add .",
      'git commit -m "Add welcome line"',
      "git blame app.js",
    ],
    suggestions: ["echo 'const user = getName();' >> app.js", "git add .", "git blame app.js"],
    visualizer: { highlight: "head", banner: "git blame traces each line back to who changed it and when" },
    shell: {
      primaryCommand: "git blame app.js",
      placeholder: "git blame",
      quickActions: ["git blame app.js", "git add .", "git log --oneline"],
      welcomeText: "Trace the lines.",
      helperText: "Add a line to app.js, commit it, then git blame to see which commit last changed it.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll trace any line back to the commit that last changed it, without any blamey feelings.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "A file has a line that puzzles you. Who wrote it? When? git blame answers both.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "The mystery sentence",
      text: "Think of a shared essay with a strange sentence. You want to ask, \"who added this, and when?\" git blame points to the person and the moment. It's like a detective tool, not an accusation.",
    },

    // ---------------------------------------------------------------
    // 1 · Run blame.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-run",
      level: 2,
      text: "Run git blame",
    },
    {
      type: "paragraph",
      id: "run-question",
      text: "Point git blame at a file and it shows which commit last changed it, and when. Panda uses a simplified blame model: it shows the last commit that touched the file.",
    },
    {
      type: "terminalSteps",
      id: "terminal-blame",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "app.js": "console.log('hi');\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      setup: ["git init", "git add .", 'git commit -m "Start project"'],
      steps: [
        {
          command: "git blame app.js",
          output: "2271f37 (Git Learner 8/9/2026) console.log('hi');",
          outputKind: "muted",
          note: "Each line shows the commit that last changed it, the author, and the date.",
        },
      ],
    },
    {
      type: "callout",
      id: "run-connect",
      tone: "success",
      title: "Reading a blame line",
      text: "The short hash identifies the commit. The name is who made it. The date is when. Once you know that, you can git show that hash to see the whole change.",
    },

    // ---------------------------------------------------------------
    // 2 · Why it's not about blame.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-not-blame",
      level: 2,
      text: "Not about blame",
    },
    {
      type: "paragraph",
      id: "not-blame-question",
      text: "The name scares people, but blame is just a nickname. Its real job is understanding, not pointing fingers.",
    },
    {
      type: "callout",
      id: "not-blame-connect",
      tone: "success",
      title: "A trace, not a trial",
      text: "Teams use blame to ask \"why does this line exist?\" so they can fix it or improve it. It's a friendly detective tool. Everyone forgets what they wrote weeks ago.",
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
      title: "Using blame to find fault",
      text: "git blame is not a way to criticize teammates. Code changes for many reasons, and a line's history is just context. Use it to understand, not to judge.",
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
        "A line in a file puzzles you. What does git blame tell you about it, and how do you see the full change?",
      hint: "The blame line has a hash. What command opens that commit?",
      exampleAnswer:
        "git blame shows who changed the line and when. Then I copy the hash into git show to see the full commit and understand why the line was added.",
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
      id: "tip-blame",
      title: "Quick tip",
      text: "git blame <file> then git show <hash> is a powerful combo: first find who and when, then read the whole story.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git blame shows which commit last changed a file.",
        "It shows when, with a commit hash.",
        "It's for understanding, not blaming.",
        "Pair it with git show to read the full change.",
        "Everyone forgets what they wrote. Be kind.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can trace any line now. Next, Git's safety net for the scariest moments: recovering lost work with git reflog.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git reflog",
      text: "Meet Git's superpower for finding work you thought was gone forever.",
    },
  ],
};
