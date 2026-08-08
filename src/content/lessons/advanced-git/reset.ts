import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git reset
 *
 * You made a commit you regret. git reset moves your branch back to an older
 * commit. It has three flavors — soft, mixed, hard — that decide how much
 * changes. None of them need to be scary.
 */
export const lessonGitReset: ContentLesson = {
  id: "reset",
  slug: "reset",
  title: "git reset",
  description:
    "git reset moves your branch back to an older commit. Three flavors — soft, mixed, hard — decide how much changes. Learn them calmly.",
  meta: {
    module: "advanced-git",
    order: 3,
    difficulty: "intermediate",
    durationMinutes: 10,
    tags: ["advanced-git", "reset"],
    summary: [
      "git reset moves your branch back.",
      "Soft keeps everything, just un-commits.",
      "Mixed also unstages your changes.",
      "Hard throws the changes away.",
      "Never hard reset shared work.",
    ],
    whyItMatters:
      "Everyone makes a commit they regret. Reset is how you take it back. Knowing the three modes keeps you safe instead of scared.",
    motivation:
      "You can undo a commit safely now. Next, a gentler undo that keeps history: git revert.",
  },
  learningGoals: [
    "Explain what reset does",
    "Tell soft, mixed, and hard apart",
    "Undo a mistake with reset",
    "Know when reset is unsafe",
  ],
  xpReward: 55,
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
      "echo 'feature work' > feature.txt",
      "git add .",
      'git commit -m "Add feature"',
      "echo 'debug junk' > debug.txt",
      "git add .",
      'git commit -m "Add debug stuff"',
    ],
    objectives: [
      {
        id: "spot",
        label: "See the messy last commit",
        checks: [{ kind: "anyCommitMessage", message: "Add debug stuff" }, { kind: "fileExists", path: "debug.txt" }],
      },
      {
        id: "undo",
        label: "Undo it for good with a hard reset",
        checks: [{ kind: "branchAtCommit", name: "main", hash: "4c98bc8" }, { kind: "fileNotExists", path: "debug.txt" }],
      },
      {
        id: "safe",
        label: "Confirm your real work is safe",
        checks: [{ kind: "fileExists", path: "feature.txt" }, { kind: "workingTreeClean" }],
      },
    ],
    hints: [
      "Look at your history with git log --oneline to see the messy commit.",
      "Your last commit added debug.txt. Reset back one step with git reset --hard HEAD~1.",
      "Now debug.txt should be gone and your working tree clean.",
      "Check that feature.txt is still there — your real work is safe.",
    ],
    solution: ["git log --oneline", "git reset --hard HEAD~1", "git status", "ls"],
    suggestions: ["git log --oneline", "git reset --hard HEAD~1", "git status"],
    visualizer: { highlight: "head", banner: "git reset steps your branch back. --hard starts clean, your real work stays safe" },
    shell: {
      primaryCommand: "git reset --hard",
      placeholder: "git reset",
      quickActions: ["git log --oneline", "git reset --hard HEAD~1", "git status"],
      welcomeText: "Undo a messy commit.",
      helperText: "Your last commit added debug junk. Reset back one step and confirm your real work is safe.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson git reset won't scare you. You'll know exactly what its three flavors change, and when to use each one.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You saved a file you now regret, and you already committed it. Is it stuck in history forever?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Taking a step back",
      text: "Imagine walking forward through a project. You realize you took a wrong step. git reset lets you step back to where you were, and decide how much of your luggage to keep. You're never stuck.",
    },

    // ---------------------------------------------------------------
    // 1 · One command, three flavors.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-modes",
      level: 2,
      text: "One command, three flavors",
    },
    {
      type: "paragraph",
      id: "modes-question",
      text: "All three flavors move your branch back to an older commit. They differ in what happens to your changes.",
    },
    {
      type: "callout",
      id: "modes-connect",
      tone: "success",
      title: "Soft, mixed, hard",
      text: "--soft keeps your changes staged, ready to recommit. --mixed (the default) keeps them in the working tree but unstaged. --hard throws them away completely. Think: soft = keep everything, hard = start clean.",
    },

    // ---------------------------------------------------------------
    // 2 · See the difference.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-see",
      level: 2,
      text: "See the difference",
    },
    {
      type: "paragraph",
      id: "see-question",
      text: "Your last commit was a mistake. Each flavor rolls it back a different way.",
    },
    {
      type: "terminalSteps",
      id: "terminal-reset",
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
          command: "git reset --soft HEAD~1",
          output: "HEAD is now at 4c98bc8 (soft reset)",
          outputKind: "success",
          note: "The commit is gone from history, but your changes are still staged. You can recommit cleanly.",
        },
        {
          command: "git reset --mixed HEAD~1",
          output: "HEAD is now at 2271f37 (mixed reset)",
          outputKind: "success",
          note: "Now your changes are also unstaged. They sit in the working tree, waiting.",
        },
        {
          command: "git reset --hard HEAD~1",
          output: "HEAD is now at 2271f37 (hard reset)",
          outputKind: "success",
          note: "Everything is gone: commit, staging, and working tree. A clean start.",
        },
      ],
    },
    {
      type: "callout",
      id: "see-connect",
      tone: "warning",
      title: "Hard means gone",
      text: "--hard is the only flavor that throws work away. Use it only when you're sure you don't need the changes. The other two are safe experiments.",
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
      title: "Hard resetting shared branches",
      text: "If a branch lives on a remote and teammates have it, never hard reset it. You'd rewrite history everyone already has. Use git revert instead, coming up next.",
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
        "You regret your last commit but want to recommit it with a better message, keeping the changes. Which reset flavor do you use?",
      hint: "You want the changes to stay staged.",
      exampleAnswer:
        "git reset --soft HEAD~1. It removes the commit but keeps my changes staged, so I can commit again with a cleaner message.",
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
      id: "tip-reset",
      title: "Quick tip",
      text: "Not sure what a reset will do? Start with --soft or --mixed. They keep your work. Only use --hard when you're certain you want a clean slate.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git reset moves your branch back.",
        "--soft keeps changes staged.",
        "--mixed keeps changes unstaged.",
        "--hard throws changes away.",
        "Never hard reset shared branches.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can undo a commit safely now. Next, a gentler undo that preserves history: git revert.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git revert",
      text: "Learn how to undo a bad commit without rewriting history.",
    },
  ],
};
