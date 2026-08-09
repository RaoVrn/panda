import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git cherry-pick
 *
 * A teammate fixed a bug on their branch, and you need that exact fix on
 * yours. git cherry-pick copies one commit  -  just that one  -  onto your branch,
 * without dragging in all their other work.
 */
export const lessonGitCherryPick: ContentLesson = {
  id: "cherry-pick",
  slug: "cherry-pick",
  title: "git cherry-pick",
  description:
    "A bug fix lives on another branch and you need it right now. git cherry-pick copies that one commit onto your branch, nothing else.",
  meta: {
    module: "advanced-git",
    order: 2,
    difficulty: "intermediate",
    durationMinutes: 9,
    tags: ["advanced-git", "cherry-pick"],
    summary: [
      "git cherry-pick copies one commit.",
      "It brings just that change, not the whole branch.",
      "Perfect for grabbing a bug fix.",
      "The copied commit gets a new hash.",
    ],
    whyItMatters:
      "Merging brings everything. Sometimes you want exactly one fix. Cherry-pick is the surgical tool for that.",
    motivation:
      "You can grab a single fix from anywhere now. Next, the trickiest of the undo tools: git reset.",
  },
  learningGoals: [
    "Explain when to cherry-pick",
    "Find the commit you need",
    "Copy it onto your branch",
    "Know when not to use it",
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
      "git switch -c fix-branch",
      "echo 'const fix = true;' > fix-login.js",
      "git add .",
      'git commit -m "Fix login bug"',
      "git switch fix-branch",
    ],
    objectives: [
      {
        id: "spot-fix",
        label: "Spot the fix on the other branch",
        checks: [
          { kind: "branchExists", name: "fix-branch" },
          { kind: "anyCommitMessage", message: "Fix login bug" },
          { kind: "ranCommand", contains: "git log" },
        ],
      },
      {
        id: "to-main",
        label: "Come back to main",
        checks: [{ kind: "branch", name: "main" }],
      },
      {
        id: "copy-fix",
        label: "Copy just the fix onto main",
        checks: [
          { kind: "ranCommand", contains: "git cherry-pick" },
          { kind: "fileExists", path: "fix-login.js" },
          { kind: "anyCommitMessage", message: "Fix login bug" },
        ],
      },
    ],
    hints: [
      "Look at the fix branch's history with git log --oneline fix-branch.",
      "Make sure you're on main with git branch.",
      "Copy the fix with git cherry-pick <hash>. Its hash is 534054b.",
      "Check that fix-login.js is now on main with ls.",
    ],
    solution: [
      "git log --oneline fix-branch",
      "git switch main",
      "git cherry-pick 534054b",
      "ls",
    ],
    suggestions: ["git log --oneline fix-branch", "git switch main", "git cherry-pick 534054b"],
    visualizer: { highlight: "repository", banner: "git cherry-pick copies one commit from another branch onto yours" },
    shell: {
      primaryCommand: "git cherry-pick",
      placeholder: "git cherry-pick",
      quickActions: ["git log --oneline fix-branch", "git switch main", "git cherry-pick 534054b"],
      welcomeText: "Copy one fix.",
      helperText: "Find the fix on fix-branch, make sure you're on main, then cherry-pick it.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll copy one fix from another branch onto yours, without merging anything else.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Your app is broken and a teammate already fixed the exact bug. But the fix sits on their branch, tangled with work you don't want yet.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Taking one recipe from a cookbook",
      text: "Think of two cookbooks. Yours is missing the perfect cake recipe, and it's in your friend's book. You don't copy the whole book, just one page. git cherry-pick copies exactly one commit, like that single recipe page.",
    },

    // ---------------------------------------------------------------
    // 1 · Copy vs merge.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-merge-vs-pick",
      level: 2,
      text: "Copy one, not everything",
    },
    {
      type: "paragraph",
      id: "merge-vs-pick-question",
      text: "Merging a branch brings every commit on it. Cherry-picking brings exactly one. That's the whole difference.",
    },
    {
      type: "callout",
      id: "merge-vs-pick-connect",
      tone: "success",
      title: "A scalpel, not a hammer",
      text: "When you need one fix, merging is like using a hammer to hang one picture. Cherry-pick is the scalpel: precise, one commit, nothing else.",
    },

    // ---------------------------------------------------------------
    // 2 · How to cherry-pick.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-how",
      level: 2,
      text: "How to cherry-pick",
    },
    {
      type: "paragraph",
      id: "how-question",
      text: "First, find the commit you want. git log on the other branch shows you its hash. Then copy it onto your branch.",
    },
    {
      type: "terminalSteps",
      id: "terminal-cherry",
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
      setup: [
        "git init",
        "git add .",
        'git commit -m "Start project"',
        "git switch -c fix-branch",
        "echo 'const fix = true;' > fix-login.js",
        "git add .",
        'git commit -m "Fix login bug"',
        "git switch main",
      ],
      steps: [
        {
          command: "git log --oneline fix-branch",
          output: "534054b Fix login bug\n2271f37 (HEAD -> main) Start project",
          outputKind: "output",
          note: "Find the fix's hash on the other branch.",
        },
        {
          command: "git cherry-pick 534054b",
          output: "[main 69b158a] Fix login bug\nOne commit copied onto your branch.",
          outputKind: "success",
          note: "The fix lands on main. The copied commit gets a new hash.",
        },
      ],
    },
    {
      type: "callout",
      id: "how-connect",
      tone: "success",
      title: "Same change, new identity",
      text: "The copied commit does the same fix but has a fresh hash, because it now has a different parent. That's normal and healthy.",
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
      title: "Cherry-picking huge feature commits",
      text: "Cherry-pick is for small, focused fixes. Grabbing a huge feature commit can drag in changes that depended on other commits. Cherry-pick only what you really need.",
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
        "A bug fix is on your teammate's branch. You want it on yours, but not their other work. What command copies just that fix?",
      hint: "It's a surgical tool, named after a fruit.",
      exampleAnswer:
        "I'd find the fix's hash with git log, then run git cherry-pick <hash> on my branch. It copies just that one commit, not the whole branch.",
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
      id: "tip-cherry",
      title: "Quick tip",
      text: "Before cherry-picking, check which branch you're on. The fix lands on the branch you're standing on right now.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git cherry-pick copies one commit.",
        "It brings just that change, not the branch.",
        "Perfect for grabbing a single bug fix.",
        "The copied commit gets a new hash.",
        "Use it for small fixes, not big features.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can grab a single fix from anywhere now. Next, the undo tool beginners fear most: git reset.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git reset",
      text: "Learn how to move back in time, safely, with three flavors of reset.",
    },
  ],
};
