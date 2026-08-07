import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Branches
 *
 * The first branching idea: a branch is a separate line of work. Like two
 * save files in a game, or two drafts of a story. You experiment on one
 * without touching the other.
 */
export const lessonBranches: ContentLesson = {
  id: "branches",
  slug: "branches",
  title: "Branches",
  description:
    "A branch is a separate line of work. You can try a new idea without touching your safe, working version.",
  meta: {
    module: "branching",
    order: 1,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["branching", "branches"],
    summary: [
      "A branch is a separate line of work.",
      "You can experiment without breaking the main version.",
      "Branches let you work on many things at once.",
      "The main branch is your safe, working version.",
    ],
    whyItMatters:
      "Branches are the reason teams can work together without stepping on each other. They're also how you can try risky ideas safely.",
    motivation:
      "You understand the branch idea now. Next, you'll create your own branch and see it appear.",
  },
  learningGoals: [
    "Explain what a branch is",
    "Know why branches keep your work safe",
    "Spot the main branch",
  ],
  xpReward: 45,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "index.html": "<h1>home</h1>\n",
        "login.js": "// login\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      "git branch feature",
      "git switch feature",
      "touch feature.txt",
      "git add .",
      'git commit -m "Work on feature"',
      "git switch main",
    ],
    objectives: [
      {
        id: "list",
        label: "List the branches and spot feature",
        checks: [{ kind: "branchExists", name: "feature" }, { kind: "branch", name: "main" }],
      },
      {
        id: "feature-work",
        label: "See that feature has its own work",
        checks: [{ kind: "commitTouchesFile", path: "feature.txt" }],
      },
      {
        id: "see-safety",
        label: "Confirm main stays safe",
        checks: [{ kind: "branch", name: "main" }, { kind: "fileNotExists", path: "feature.txt" }],
      },
    ],
    hints: [
      "Run git branch to see the branches. The star shows where you are.",
      "Check the history with git log --oneline. The feature branch has its own commit.",
      "You're back on main now. Notice feature.txt isn't there. That's the safety.",
    ],
    solution: ["git branch", "git log --oneline", "git switch main"],
    suggestions: ["git branch", "git switch feature", "git switch main"],
    visualizer: { highlight: "head", banner: "A branch is a separate line of work that leaves main safe" },
    shell: {
      primaryCommand: "git branch",
      placeholder: "git branch",
      quickActions: ["git branch", "git switch feature", "git switch main"],
      welcomeText: "Explore the branches.",
      helperText: "This repo already has two branches. List them, visit feature, then come back to main.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll know why branches make experimenting safe, even when you're working on your own.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Think about a school project. You've written a great first draft. Now you want to try a bold new opening.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Two drafts, one story",
      text: "Would you rewrite your only copy? No. You'd copy it, try the bold opening on the copy, and keep your safe original. A branch is that copy. Git keeps both versions side by side.",
    },
    {
      type: "paragraph",
      id: "problem-question",
      text: "Without branches, every change happens on one line of work. A broken idea breaks everything. With branches, an idea lives on its own line until it's ready.",
    },
    {
      type: "callout",
      id: "solution",
      tone: "success",
      title: "Git's answer",
      text: "A branch is a separate line of work in your repository. The main branch holds your safe, working version. New ideas go on new branches, where they can't hurt anything.",
    },

    // ---------------------------------------------------------------
    // 1 · See the branches.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-see",
      level: 2,
      text: "See it visually",
    },
    {
      type: "paragraph",
      id: "see-question",
      text: "Picture your history as a line of dots. Each dot is a snapshot. A branch is a fork in that line, where a second line starts.",
    },
    {
      type: "gitGraph",
      id: "visual-branches",
      title: "One line becomes two",
      width: 340,
      height: 96,
      commits: [
        { id: "c1", x: 30, y: 30, lane: 0, message: "Start project", branch: "main" },
        { id: "c2", x: 96, y: 30, lane: 0, message: "Add homepage", branch: "main" },
        { id: "c3", x: 162, y: 30, lane: 0, message: "Add login", branch: "feature" },
        { id: "c4", x: 228, y: 30, lane: 0, message: "Finish login", branch: "feature", accent: true },
        { id: "c5", x: 228, y: 78, lane: 1, message: "Fix a bug", branch: "main" },
      ],
      lines: [
        {
          id: "timeline",
          points: [
            { x: 30, y: 30 },
            { x: 96, y: 30 },
            { x: 162, y: 30 },
            { x: 228, y: 30 },
          ],
        },
        {
          id: "mainline",
          points: [
            { x: 96, y: 30 },
            { x: 228, y: 78 },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      id: "see-explain",
      text: "See the fork? The main line keeps going, and the feature line heads off on its own. Each line can be changed without touching the other.",
    },

    // ---------------------------------------------------------------
    // 2 · The main branch.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-main",
      level: 2,
      text: "The main branch",
    },
    {
      type: "paragraph",
      id: "main-question",
      text: "Every repository starts with one branch. Git calls it main. This is your safe, working version, the one you can always trust.",
    },
    {
      type: "callout",
      id: "main-connect",
      tone: "info",
      title: "Why name it main?",
      text: "Main just means \"the main line of work\". It's the default, and it's where finished ideas usually end up. You can call it anything, but main is the convention everyone uses.",
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
      title: "Thinking a branch is a copy of your files",
      text: "A branch isn't a separate copy of every file. It's a separate line of history. Both branches share the same files until you change them differently. Git tracks the lines, not extra copies.",
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
        "Why is a branch safer than editing your only copy of a project?",
      hint: "What happens to your safe version if an idea on a branch goes badly?",
      exampleAnswer:
        "Because my safe version stays untouched. If the idea on the branch fails, I still have my working main branch. The branch kept the experiment separate.",
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
      id: "tip-branches",
      title: "Quick tip",
      text: "Think of the main branch as the trunk of a tree. New branches grow off it, and finished work gets attached back to it.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "A branch is a separate line of work.",
        "main is your safe, working version.",
        "Branches share files but keep separate history.",
        "You can experiment without breaking anything.",
        "Finished ideas get joined back to main later.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You understand what a branch is. Now let's create one and see it appear in the visualizer.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git branch",
      text: "Learn the command that creates and lists branches, so you can start your own line of work.",
    },
  ],
};
