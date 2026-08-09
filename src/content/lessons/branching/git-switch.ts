import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git switch
 *
 * Moving between branches. git switch steps you onto another branch, so your
 * next snapshot lands on the right line of work.
 */
export const lessonGitSwitch: ContentLesson = {
  id: "git-switch",
  slug: "git-switch",
  title: "git switch",
  description:
    "git switch moves you onto another branch. It's how you step into a new line of work and start building.",
  meta: {
    module: "branching",
    order: 3,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["branching", "switch"],
    summary: [
      "git switch <name> moves you to a branch.",
      "git switch -c <name> creates and moves at once.",
      "Your next commit lands on the branch you're on.",
      "Commit your work before switching.",
    ],
    whyItMatters:
      "A branch only matters if you're on it. git switch is how you step onto a branch so your work goes to the right place.",
    motivation:
      "You can move between branches now. Next, the older command that does a similar job: git checkout.",
  },
  learningGoals: [
    "Switch to a branch with git switch",
    "Create and switch with -c",
    "Know what blocks a switch",
  ],
  xpReward: 45,
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
    ],
    objectives: [
      {
        id: "commit-there",
        label: "Commit the cart on add-cart",
        checks: [{ kind: "anyCommitMessage", message: "Add the cart" }, { kind: "ranCommand", contains: "git switch add-cart" }],
      },
      {
        id: "cart-stays",
        label: "Keep the cart work off main",
        checks: [
          { kind: "branch", name: "main" },
          { kind: "fileNotExists", path: "cart.js" },
          { kind: "ranCommand", contains: "git switch add-cart" },
        ],
      },
      {
        id: "back-main",
        label: "Return to main",
        checks: [{ kind: "branch", name: "main" }, { kind: "ranCommand", contains: "git switch main" }],
      },
    ],
    hints: [
      "Move onto add-cart with git switch add-cart.",
      "Create cart.js, stage it, and commit with a clear message.",
      "Come back to main with git switch main. The cart file isn't here, because it lives on add-cart.",
    ],
    solution: [
      "git switch add-cart",
      "touch cart.js",
      "git add .",
      'git commit -m "Add the cart"',
      "git switch main",
    ],
    suggestions: ["git switch add-cart", "git switch main", "git switch -c add-cart"],
    visualizer: { highlight: "head", banner: "git switch moves your star onto another line of work" },
    shell: {
      primaryCommand: "git switch add-cart",
      placeholder: "git switch",
      quickActions: ["git switch add-cart", "git switch main"],
      welcomeText: "Move between branches.",
      helperText: "Switch onto add-cart, make a commit, then come back to main.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll move between branches and know where your next snapshot will land.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You've created a branch called add-cart. Now you want to build the cart. But how do you get onto that branch?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Changing desks",
      text: "Imagine two desks in a room. The main desk is where the stable work happens. The add-cart desk is for your new feature. git switch is how you walk over and sit at the add-cart desk.",
    },

    // ---------------------------------------------------------------
    // 1 · Switch to a branch.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-switch",
      level: 2,
      text: "Step onto your branch",
    },
    {
      type: "paragraph",
      id: "switch-question",
      text: "Move onto your new branch, then check that you're really there.",
    },
    {
      type: "terminalSteps",
      id: "terminal-switch",
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
      setup: ["git init", "git add .", 'git commit -m "Start project"', "git branch add-cart"],
      steps: [
        {
          command: "git switch add-cart",
          output: "Switched to branch 'add-cart'",
          outputKind: "success",
          note: "You're now on the add-cart line of work.",
        },
        {
          command: "git branch",
          output: "  main\n* add-cart",
          outputKind: "output",
          note: "The star moved to add-cart. That's where your next snapshot will land.",
        },
      ],
    },
    {
      type: "callout",
      id: "switch-connect",
      tone: "success",
      title: "The star moved",
      text: "Now the star sits on add-cart. Anything you commit from here goes onto add-cart, not main. That's exactly what you want.",
    },

    // ---------------------------------------------------------------
    // 2 · Create and switch in one step.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-create-switch",
      level: 2,
      text: "Create and switch together",
    },
    {
      type: "paragraph",
      id: "create-switch-question",
      text: "Creating and switching is so common that Git has a shortcut: add -c to switch and create at once.",
    },
    {
      type: "terminalSteps",
      id: "terminal-create-switch",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git switch -c fix-nav",
          output: "Switched to a new branch 'fix-nav'",
          outputKind: "success",
          note: "One command, two jobs: it created fix-nav and stepped onto it.",
        },
        {
          command: "git branch",
          output: "  main\n* fix-nav",
          outputKind: "output",
          note: "You're on the new branch, ready to work.",
        },
      ],
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
      title: "Switching with unsaved work",
      text: "In Panda's simulator, switching branches can discard uncommitted changes. Commit your work first if you want to keep it. In real Git, Git usually refuses to switch when doing so would overwrite local changes.",
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
        "You want a new branch AND to start working on it immediately. What single command does both?",
      hint: "It's git switch with one extra letter.",
      exampleAnswer:
        "I'd use git switch -c new-branch. The -c creates the branch and switches to it in one step, so I can start working right away.",
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
      id: "tip-switch",
      title: "Quick tip",
      text: "Run git branch after switching to confirm the star moved. A two-second check saves confusion later.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git switch <name> moves you onto a branch.",
        "git switch -c <name> creates and moves at once.",
        "The star shows your current branch.",
        "Your next commit lands on the current branch.",
        "Commit your work before switching.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can move between branches now. Let's meet the older command that does the same job, so you recognize it when you see it.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git checkout",
      text: "git checkout is an older way to switch branches. It still works, and you'll see it everywhere.",
    },
  ],
};
