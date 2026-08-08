import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Squashing Commits
 *
 * Five "wip" commits before a pull request is a messy story. Squashing folds
 * them into one clean commit. Use a soft reset back to the fork point, then
 * commit once with a clear message.
 */
export const lessonSquash: ContentLesson = {
  id: "squash",
  slug: "squash",
  title: "Squashing Commits",
  description:
    "Too many messy commits before a pull request? Squash them into one clean commit so your work tells a clear story.",
  meta: {
    module: "advanced-git",
    order: 6,
    difficulty: "advanced",
    durationMinutes: 10,
    tags: ["advanced-git", "squash"],
    summary: [
      "Squash folds several commits into one.",
      "It turns a messy history into a clean story.",
      "A soft reset brings commits back as changes.",
      "One final commit tells the whole story.",
    ],
    whyItMatters:
      "Reviewers read your commits. Five 'wip' lines are noise; one clean commit is a story. Squashing is how you hand them a story.",
    motivation:
      "You can present clean history now. Finally, meet tags: bookmarks for the versions you'll never want to lose.",
  },
  learningGoals: [
    "Explain why squashing helps",
    "Fold many commits into one",
    "Write one clear commit message",
    "Know when to squash",
  ],
  xpReward: 55,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "cart.js": "// cart\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      "echo '// cart 1' >> cart.js",
      "git add .",
      'git commit -m "wip"',
      "echo '// cart 2' >> cart.js",
      "git add .",
      'git commit -m "typo"',
      "echo '// cart 3' >> cart.js",
      "git add .",
      'git commit -m "again"',
      "echo '// cart 4' >> cart.js",
      "git add .",
      'git commit -m "wip 2"',
      "echo '// cart 5' >> cart.js",
      "git add .",
      'git commit -m "wip 3"',
    ],
    objectives: [
      {
        id: "messy",
        label: "See five messy commits on main",
        checks: [{ kind: "commitCountEquals", count: 6 }],
      },
      {
        id: "fold",
        label: "Fold them back with a soft reset",
        checks: [{ kind: "reflogHas", text: "reset" }, { kind: "commitCountEquals", count: 1 }],
      },
      {
        id: "clean",
        label: "Make one clean commit",
        checks: [
          { kind: "latestCommitMessage", message: "Implement the cart feature" },
          { kind: "commitCountEquals", count: 2 },
          { kind: "workingTreeClean" },
        ],
      },
    ],
    hints: [
      "Look at history with git log --oneline. Five commits say almost nothing.",
      "Fold them back with git reset --soft HEAD~5. All the changes stay staged.",
      "Check git status — your work is staged and ready.",
      "Make one clean commit: git commit -m \"Implement the cart feature\".",
      "Run git log --oneline to see the clean story.",
    ],
    solution: [
      "git log --oneline",
      "git reset --soft HEAD~5",
      "git status",
      'git commit -m "Implement the cart feature"',
      "git log --oneline",
    ],
    suggestions: ["git log --oneline", "git reset --soft HEAD~5", 'git commit -m "Implement the cart feature"'],
    visualizer: { highlight: "staging", banner: "Squash turns five messy commits into one clean commit, ready for a pull request" },
    shell: {
      primaryCommand: "git reset --soft",
      placeholder: "git reset --soft",
      quickActions: ["git log --oneline", "git reset --soft HEAD~5", "git status", 'git commit -m "Implement the cart feature"'],
      welcomeText: "Turn five commits into one.",
      helperText: "Your history is full of 'wip' commits. Fold them into one clean commit.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll turn a pile of messy commits into one clean commit that tells the whole story.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You finished a feature, but along the way you made five small commits: \"wip\", \"typo\", \"again\". Would you hand that to a reviewer?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Five drafts, one final page",
      text: "Think of writing an essay. You rewrite it five times, but you only hand in the final page. Squashing is that: your many drafts become one clean commit that says what you actually did.",
    },

    // ---------------------------------------------------------------
    // 1 · Before and after.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-before-after",
      level: 2,
      text: "Before and after",
    },
    {
      type: "paragraph",
      id: "before-after-question",
      text: "Here's a messy feature history. Five commits say almost nothing.",
    },
    {
      type: "gitGraph",
      id: "visual-before",
      title: "Before: five messy commits",
      width: 380,
      height: 70,
      commits: [
        { id: "base", x: 30, y: 24, lane: 0, message: "main" },
        { id: "w1", x: 105, y: 24, lane: 0, message: "wip" },
        { id: "w2", x: 180, y: 24, lane: 0, message: "typo" },
        { id: "w3", x: 255, y: 24, lane: 0, message: "again" },
        { id: "w4", x: 330, y: 24, lane: 0, message: "wip 2", accent: true },
      ],
      lines: [
        { id: "messy", points: [{ x: 30, y: 24 }, { x: 105, y: 24 }, { x: 180, y: 24 }, { x: 255, y: 24 }, { x: 330, y: 24 }] },
      ],
    },
    {
      type: "callout",
      id: "before-connect",
      tone: "info",
      title: "Noise, not signal",
      text: "\"wip\" and \"typo\" tell a reviewer nothing. They're drafts. Squashing gives you one commit that explains the whole feature.",
    },

    // ---------------------------------------------------------------
    // 2 · How to squash.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-how",
      level: 2,
      text: "How to squash",
    },
    {
      type: "paragraph",
      id: "how-question",
      text: "Go back to where your feature started, turning your commits back into staged changes. Then make one clean commit.",
    },
    {
      type: "terminalSteps",
      id: "terminal-squash",
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
      steps: [
        {
          command: "git reset --soft HEAD~5",
          output: "HEAD is now at 2271f37 (soft reset)",
          outputKind: "success",
          note: "Your five commits are undone, but all their changes stay staged.",
        },
        {
          command: "git commit -m \"Implement the cart feature\"",
          output: "[main 7c8f830] Implement the cart feature\n 5 files changed",
          outputKind: "success",
          note: "One commit now holds the whole feature. Five drafts became one final page.",
        },
      ],
    },
    {
      type: "callout",
      id: "how-connect",
      tone: "success",
      title: "Soft reset + one commit",
      text: "A soft reset takes the commits away but keeps the work. Then a single commit with a clear message tells the whole story. Many teams do this right before a pull request.",
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
      title: "Squashing shared history",
      text: "Only squash commits that haven't left your machine. If a teammate already pulled them, squashing rewrites history they have. Squash before you share.",
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
        "Your feature branch has five messy commits on top of main. What two commands turn them into one clean commit?",
      hint: "First bring the commits back as staged changes.",
      exampleAnswer:
        "I'd run git reset --soft HEAD~5 to undo the five commits but keep their changes staged, then git commit -m with one clear message.",
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
      id: "tip-squash",
      title: "Quick tip",
      text: "Squash right before opening a pull request. Reviewers will thank you for one clear commit instead of five 'wip' lines.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "Squash folds many commits into one.",
        "Soft reset brings commits back as changes.",
        "One clear commit tells the whole story.",
        "It makes pull requests easy to review.",
        "Never squash shared history.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can present clean history now. Finally, meet tags: bookmarks for the versions you'll never want to lose.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Tags",
      text: "Learn how to mark important versions like v1.0 so you can always find them.",
    },
  ],
};
