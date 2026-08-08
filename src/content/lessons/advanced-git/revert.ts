import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git revert
 *
 * Reset rewrites history; revert adds a new commit that undoes an old one.
 * When the bad commit is already shared, revert is the safe undo because it
 * keeps history intact for everyone.
 */
export const lessonGitRevert: ContentLesson = {
  id: "revert",
  slug: "revert",
  title: "git revert",
  description:
    "A bad commit went out to the team. git revert undoes it with a NEW commit, so history stays intact for everyone. It's the safe undo for shared work.",
  meta: {
    module: "advanced-git",
    order: 4,
    difficulty: "intermediate",
    durationMinutes: 9,
    tags: ["advanced-git", "revert"],
    summary: [
      "git revert undoes a commit with a new commit.",
      "History is preserved, nothing rewritten.",
      "It's safe for shared branches.",
      "Reset rewrites; revert records.",
    ],
    whyItMatters:
      "Reset is fine for your own unpublished work. Once a commit is shared, revert is the only polite way to undo it.",
    motivation:
      "You can undo shared work safely now. Next, the history-rewriting powerhouse: git rebase.",
  },
  learningGoals: [
    "Explain when to revert",
    "Revert a bad commit",
    "Compare revert with reset",
    "Know it's safe on shared branches",
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
      "echo 'const bug = true; // BUG' >> app.js",
      "git add .",
      'git commit -m "Add bug"',
    ],
    objectives: [
      {
        id: "see-bug",
        label: "See the bad change in the working tree",
        checks: [{ kind: "fileContent", path: "app.js", contains: "BUG" }],
      },
      {
        id: "revert",
        label: "Undo it with git revert",
        checks: [
          { kind: "latestCommitMessage", message: 'Revert "Add bug"' },
          { kind: "workingTreeClean" },
        ],
      },
      {
        id: "history",
        label: "Confirm history is preserved",
        checks: [
          { kind: "commitCountAtLeast", count: 3 },
          { kind: "anyCommitMessage", message: "Add bug" },
        ],
      },
    ],
    hints: [
      "Your last commit added a bug line to app.js. See it with cat app.js.",
      "Undo it with git revert HEAD. A new commit appears.",
      "Check app.js again, the bug line is gone.",
      "Run git log --oneline to see that the bad commit is still in history.",
    ],
    solution: ["cat app.js", "git revert HEAD", "cat app.js", "git log --oneline"],
    suggestions: ["cat app.js", "git revert HEAD", "git log --oneline"],
    visualizer: { highlight: "repository", banner: "git revert undoes a bad commit with a new one, keeping history intact" },
    shell: {
      primaryCommand: "git revert",
      placeholder: "git revert",
      quickActions: ["cat app.js", "git revert HEAD", "git log --oneline"],
      welcomeText: "Undo without rewriting.",
      helperText: "Your last commit added a bug. Revert it, then confirm history stayed intact.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll undo a bad commit that's already shared, without ever rewriting history.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "A bad commit went to the team, and everyone pulled it. You can't just delete it, because your teammates already built on it.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "The crossed-out page",
      text: "Imagine a shared diary. Someone wrote a wrong page. You can't tear the page out, because everyone copied it. Instead, you add a new page that says \"ignore that one.\" git revert is that new page: a commit that undoes the bad one.",
    },

    // ---------------------------------------------------------------
    // 1 · Revert vs reset.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-revert-vs-reset",
      level: 2,
      text: "Revert vs reset",
    },
    {
      type: "paragraph",
      id: "revert-vs-reset-question",
      text: "Both undo a bad commit. Reset removes the commit from history. Revert adds a new commit that reverses it.",
    },
    {
      type: "callout",
      id: "revert-vs-reset-connect",
      tone: "success",
      title: "Rewrite vs record",
      text: "Reset rewrites the past. Revert records the fix in the present. That's why revert is the only one that's safe when other people already have the commit.",
    },

    // ---------------------------------------------------------------
    // 2 · How to revert.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-how",
      level: 2,
      text: "How to revert",
    },
    {
      type: "paragraph",
      id: "how-question",
      text: "Point git revert at the bad commit. Git figures out the opposite of that change and commits it for you.",
    },
    {
      type: "terminalSteps",
      id: "terminal-revert",
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
          command: "git revert 8c84c0c",
          output: "[main 6ae3e1b] Revert \"Add bug\"\nA new commit undoes the old change. History stays intact.",
          outputKind: "success",
          note: "A brand-new commit appears that reverses the bad one.",
        },
        {
          command: "git log --oneline",
          output: "6ae3e1b (HEAD -> main) Revert \"Add bug\"\n8c84c0c Add bug\n2271f37 Start project",
          outputKind: "output",
          note: "Notice the bad commit is still there. Revert added to the story instead of erasing it.",
        },
      ],
    },
    {
      type: "callout",
      id: "how-connect",
      tone: "success",
      title: "History stays complete",
      text: "After revert, the bad commit is still in the log. That's the point. Everyone's history stays the same, and the fix rides on top.",
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
      title: "Using reset on shared branches",
      text: "Once a commit is shared, don't reset it away. Teammates will still have it, and history will disagree. Use revert to undo shared work cleanly.",
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
        "A bad commit is already on the shared branch everyone uses. Should you reset or revert it? Why?",
      hint: "Your teammates already have the commit.",
      exampleAnswer:
        "I'd use git revert, because it adds a new undo commit instead of rewriting history. Reset would confuse everyone who already pulled the bad commit.",
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
      id: "tip-revert",
      title: "Quick tip",
      text: "Not sure if a commit is shared? When in doubt, use revert. It's never rude, and it works everywhere.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git revert undoes with a new commit.",
        "History stays intact, nothing rewritten.",
        "It's safe on shared branches.",
        "Reset rewrites, revert records.",
        "When in doubt, revert.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can undo shared work safely now. Next, the tool that rewrites history into a clean line: git rebase.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git rebase",
      text: "Learn how to put your branch on top of the newest main, with a straight history.",
    },
  ],
};
