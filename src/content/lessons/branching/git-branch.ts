import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git branch
 *
 * The command that creates and lists branches. One word, two jobs: show
 * what branches exist, and make a new one.
 */
export const lessonGitBranch: ContentLesson = {
  id: "git-branch",
  slug: "git-branch",
  title: "git branch",
  description:
    "git branch shows your branches and creates new ones. It's how you start your own line of work.",
  meta: {
    module: "branching",
    order: 2,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["branching", "branch"],
    summary: [
      "git branch lists your branches.",
      "git branch <name> creates a new one.",
      "The star marks your current branch.",
      "Creating a branch doesn't switch to it.",
    ],
    whyItMatters:
      "Every new idea starts with a branch. git branch is the command that makes that first fork in your history.",
    motivation:
      "You've created a branch. Next, you'll learn how to move onto it and start working.",
  },
  learningGoals: [
    "List branches with git branch",
    "Create a branch with git branch <name>",
    "Know that creating doesn't switch",
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
    setup: ["git init", "git add .", 'git commit -m "Start project"'],
    objectives: [
      {
        id: "list",
        label: "List your branches with git branch",
        checks: [{ kind: "branch", name: "main" }, { kind: "ranCommand", contains: "git branch" }],
      },
      {
        id: "create",
        label: "Create a branch named add-cart",
        checks: [{ kind: "branchExists", name: "add-cart" }],
      },
      {
        id: "still-main",
        label: "Stay on main after creating the branch",
        checks: [{ kind: "branch", name: "main" }, { kind: "ranCommand", contains: "git branch add-cart" }],
      },
    ],
    hints: [
      "Run git branch to see the branches. The star shows where you are.",
      "Create your branch with git branch add-cart.",
      "Run git branch again. The star is still on main, because creating isn't switching.",
    ],
    solution: ["git branch", "git branch add-cart", "git branch"],
    suggestions: ["git branch", "git branch add-cart"],
    visualizer: { highlight: "head", banner: "git branch creates a new line of work" },
    shell: {
      primaryCommand: "git branch",
      placeholder: "git branch",
      quickActions: ["git branch", "git branch add-cart"],
      welcomeText: "Create your first branch.",
      helperText: "List your branches, then create a new one named add-cart.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll create your own branch and see it appear in the list, ready for work.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You want to add a new feature to your website. You don't want to touch the homepage everyone uses. Where do you start?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "A spare notebook page",
      text: "Think of a new branch like a fresh page in your notebook. You start it, you name it, and you write your new idea there. The old pages stay untouched.",
    },

    // ---------------------------------------------------------------
    // 1 · See your branches.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-list",
      level: 2,
      text: "See what branches exist",
    },
    {
      type: "paragraph",
      id: "list-question",
      text: "First, ask Git what branches you have. Just type git branch.",
    },
    {
      type: "terminalSteps",
      id: "terminal-list",
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
          command: "git branch",
          output: "* main",
          outputKind: "output",
          note: "The star means you're on the main branch right now.",
        },
      ],
    },
    {
      type: "callout",
      id: "list-connect",
      tone: "success",
      title: "Reading the star",
      text: "The line with the star is where you are. Right now that's main. When you create more branches, they'll each get a line here.",
    },

    // ---------------------------------------------------------------
    // 2 · Create a branch.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-create",
      level: 2,
      text: "Create a branch",
    },
    {
      type: "paragraph",
      id: "create-question",
      text: "Now create a branch for your new feature. Pick a clear name, like the feature you're building.",
    },
    {
      type: "terminalSteps",
      id: "terminal-create",
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
          command: "git branch add-cart",
          output: "Created branch 'add-cart'",
          outputKind: "success",
          note: "A new branch appeared, named after the feature.",
        },
        {
          command: "git branch",
          output: "* main\n  add-cart",
          outputKind: "output",
          note: "The star is still on main. Creating a branch doesn't move you onto it.",
        },
      ],
    },
    {
      type: "callout",
      id: "create-connect",
      tone: "success",
      title: "Created, not switched",
      text: "Notice the star didn't move. git branch only creates the branch. It doesn't put you on it. You still need git switch to step onto it, which is the next lesson.",
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
      title: "Forgetting to switch",
      text: "A very common slip: you create a branch, then start editing files, and only later realize you're still on main. Remember, git branch creates. git switch moves. Do both.",
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
        "You typed git branch fix-nav and it worked. But you're still on main. Why didn't you move onto the new branch?",
      hint: "What does git branch do, and what does it not do?",
      exampleAnswer:
        "Because git branch only creates the branch. It doesn't switch to it. I'd need git switch fix-nav to actually move onto it and start working there.",
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
      id: "tip-branch",
      title: "Quick tip",
      text: "Name branches by what they do, like add-cart or fix-nav. Clear names make your history easy to read later.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git branch lists your branches.",
        "git branch <name> creates a new one.",
        "The star shows your current branch.",
        "Creating a branch does not switch to it.",
        "Use clear, action-like branch names.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can create a branch now. But how do you actually step onto it and start working? That's next.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git switch",
      text: "Learn the command that moves you onto a branch so your next snapshot lands in the right place.",
    },
  ],
};
