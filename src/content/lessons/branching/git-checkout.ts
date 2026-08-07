import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git checkout
 *
 * The older way to switch branches. Newer projects prefer git switch, but
 * git checkout is everywhere and does a couple of extra things too.
 */
export const lessonGitCheckout: ContentLesson = {
  id: "git-checkout",
  slug: "git-checkout",
  title: "git checkout",
  description:
    "git checkout is the older command for switching branches. You'll see it everywhere, so it pays to recognize it.",
  meta: {
    module: "branching",
    order: 4,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["branching", "checkout"],
    summary: [
      "git checkout <name> switches branches.",
      "It's the older name for git switch.",
      "New projects prefer git switch.",
      "You'll still see checkout in tutorials.",
    ],
    whyItMatters:
      "Half the tutorials on the internet use git checkout. Recognizing it means older guides and real projects make sense.",
    motivation:
      "You can switch branches two ways now. Next, the big one: joining branches together with merge.",
  },
  learningGoals: [
    "Switch branches with git checkout",
    "Know it's the same as git switch",
    "Recognize it in old tutorials",
  ],
  xpReward: 40,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "index.html": "<h1>home</h1>\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      "git branch add-cart",
      "git branch fix-nav",
    ],
    objectives: [
      {
        id: "branches-ready",
        label: "Have add-cart and fix-nav ready",
        checks: [{ kind: "branchExists", name: "add-cart" }, { kind: "branchExists", name: "fix-nav" }],
      },
      {
        id: "commit-fix",
        label: "Make a commit on fix-nav",
        checks: [{ kind: "anyCommitMessage", message: "Fix the nav" }],
      },
      {
        id: "return",
        label: "Return to main",
        checks: [{ kind: "branch", name: "main" }],
      },
    ],
    hints: [
      "Move onto add-cart with git checkout add-cart, then onto fix-nav with git checkout fix-nav.",
      "On fix-nav, create nav.js, stage it, and commit with a clear message.",
      "Come home to main with git checkout main.",
    ],
    solution: [
      "git checkout add-cart",
      "git checkout fix-nav",
      "touch nav.js",
      "git add .",
      'git commit -m "Fix the nav"',
      "git checkout main",
    ],
    suggestions: ["git checkout add-cart", "git checkout fix-nav", "git checkout main"],
    visualizer: { highlight: "head", banner: "git checkout moves you between branches, the old-fashioned way" },
    shell: {
      primaryCommand: "git checkout",
      placeholder: "git checkout",
      quickActions: ["git checkout add-cart", "git checkout fix-nav", "git checkout main"],
      welcomeText: "Switch branches the old way.",
      helperText: "Hop between add-cart, fix-nav, and back to main using git checkout.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll switch branches with git checkout and know why some projects still use it.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Older versions of Git didn't have git switch. Before that, everyone used git checkout to move between branches.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "A nickname that stuck",
      text: "Imagine a tool that was called by its old name for years. Everyone learned it that way. Then a clearer name came along. Old habits are slow to change. git checkout is that old name.",
    },

    // ---------------------------------------------------------------
    // 1 · Checkout a branch.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-checkout",
      level: 2,
      text: "Switch with checkout",
    },
    {
      type: "paragraph",
      id: "checkout-question",
      text: "Move onto a branch using the older command. It works exactly like git switch.",
    },
    {
      type: "terminalSteps",
      id: "terminal-checkout",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "index.html": "<h1>home</h1>\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git checkout add-cart",
          output: "Switched to branch 'add-cart'",
          outputKind: "success",
          note: "Same result as git switch, older command.",
        },
        {
          command: "git branch",
          output: "* add-cart\n  main",
          outputKind: "output",
          note: "The star moved to add-cart.",
        },
      ],
    },
    {
      type: "callout",
      id: "checkout-connect",
      tone: "success",
      title: "Same job, older name",
      text: "git checkout add-cart and git switch add-cart do the same thing. Git kept both so nothing breaks.",
    },

    // ---------------------------------------------------------------
    // 2 · Which one should you use?
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-which",
      level: 2,
      text: "Which should you use?",
    },
    {
      type: "paragraph",
      id: "which-question",
      text: "New projects use git switch because its name is clearer and safer. But you should recognize git checkout so old guides and existing projects make sense.",
    },
    {
      type: "callout",
      id: "which-connect",
      tone: "tip",
      title: "A simple rule",
      text: "Use git switch for new work. Understand git checkout so nothing surprises you. Both get you onto a branch.",
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
      title: "Thinking checkout deletes things",
      text: "git checkout never deletes your branches or files. It only moves your position. If you're nervous, run git branch first to see your branches are still there.",
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
        "An old tutorial tells you to type git checkout feature. What does this command do?",
      hint: "It's the older name for a command you already know.",
      exampleAnswer:
        "It switches me onto the feature branch, the same as git switch feature. It's just the older command name.",
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
      id: "tip-checkout",
      title: "Quick tip",
      text: "When you see git checkout in a tutorial, mentally translate it to git switch. They do the same job.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git checkout <name> switches branches.",
        "It's the older name for git switch.",
        "Both commands do the same job.",
        "New projects prefer git switch.",
        "Recognize checkout in old guides.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can move between branches two ways now. The real power comes when you join branches back together.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Merging branches",
      text: "Learn how to bring the work from one branch back into main with git merge.",
    },
  ],
};
