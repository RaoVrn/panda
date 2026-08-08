import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git rebase
 *
 * Your feature branch started from an old main. git rebase replays your
 * commits on top of the newest main, turning a tangled history into one
 * straight line. Rewrite only your own unpublished work.
 */
export const lessonGitRebase: ContentLesson = {
  id: "rebase",
  slug: "rebase",
  title: "git rebase",
  description:
    "Your branch is behind main. git rebase picks up your commits and replays them on top of the newest main, giving you one clean, straight line of history.",
  meta: {
    module: "advanced-git",
    order: 5,
    difficulty: "advanced",
    durationMinutes: 11,
    tags: ["advanced-git", "rebase"],
    summary: [
      "Rebase replays your commits on new main.",
      "History becomes one straight line.",
      "Rebase cleans up; merge preserves.",
      "Never rebase shared history.",
    ],
    whyItMatters:
      "Before a pull request, a straight history makes reviewers happy. Rebase is how you get your work onto the latest main without a messy tangle.",
    motivation:
      "You can lay your work on top of the newest main now. Next, combine messy commits into one clean one with squashing.",
  },
  learningGoals: [
    "Explain what rebase does",
    "Rebase a feature branch onto main",
    "Compare rebase with merge",
    "Know not to rebase shared history",
  ],
  xpReward: 60,
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
      'echo "home" > index.html',
      "git add .",
      'git commit -m "Add homepage"',
      "git switch -c feature",
      'echo "search" > search.js',
      "git add .",
      'git commit -m "Add search"',
      'echo "cart" > cart.js',
      "git add .",
      'git commit -m "Add cart"',
      "git switch main",
      'echo "profile" > profile.js',
      "git add .",
      'git commit -m "Add profile"',
      "git switch feature",
    ],
    objectives: [
      {
        id: "spot",
        label: "Spot your feature branch",
        checks: [{ kind: "branchExists", name: "feature" }],
      },
      {
        id: "stand",
        label: "Stand on the feature branch",
        checks: [{ kind: "branch", name: "feature" }],
      },
      {
        id: "rebase",
        label: "Rebase your work onto main",
        checks: [
          { kind: "branchDescendantOf", name: "feature", ancestor: "main" },
          { kind: "reflogHas", text: "rebase onto main" },
        ],
      },
    ],
    hints: [
      "Look at history with git log --oneline. Main moved ahead with Add profile.",
      "Make sure you're on feature with git branch.",
      "Lay your work onto main with git rebase main.",
      "Run git log --oneline again, now your commits sit on top of main in one line.",
    ],
    solution: ["git log --oneline", "git branch", "git rebase main", "git log --oneline"],
    suggestions: ["git log --oneline", "git branch", "git rebase main"],
    visualizer: { highlight: "repository", banner: "git rebase lays your commits on top of the newest main, in one straight line" },
    shell: {
      primaryCommand: "git rebase main",
      placeholder: "git rebase",
      quickActions: ["git log --oneline", "git branch", "git rebase main"],
      welcomeText: "Straighten your history.",
      helperText: "Your feature branch is behind main. Rebase it onto main and watch the line straighten.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll lay your feature commits on top of the newest main, turning tangled history into a straight line.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You started your feature weeks ago. Main has moved on. Your branch and main now look like a tangled road.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Straightening a messy road",
      text: "Imagine two roads that split and wander. git rebase takes your road and lifts it, laying it straight on top of the newest main. Same destinations, but one clean line instead of a knot.",
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
      text: "Here's your history before the rebase. Your feature split off from an old main.",
    },
    {
      type: "gitGraph",
      id: "visual-before",
      title: "Before rebase",
      width: 380,
      height: 120,
      commits: [
        { id: "c1", x: 30, y: 24, lane: 0, message: "c1" },
        { id: "c2", x: 130, y: 24, lane: 0, message: "c2 (main)" },
        { id: "f1", x: 130, y: 84, lane: 1, message: "f1" },
        { id: "f2", x: 230, y: 84, lane: 1, message: "f2 (feature)" },
      ],
      lines: [
        { id: "main-line", points: [{ x: 30, y: 24 }, { x: 130, y: 24 }] },
        { id: "branch-off", points: [{ x: 30, y: 24 }, { x: 130, y: 84 }] },
        { id: "feature-line", points: [{ x: 130, y: 84 }, { x: 230, y: 84 }] },
      ],
    },
    {
      type: "callout",
      id: "before-connect",
      tone: "info",
      title: "Two lines, one shared past",
      text: "Feature and main share c1, then go separate ways. That split is what rebase removes.",
    },

    // ---------------------------------------------------------------
    // 2 · After rebase.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-after",
      level: 2,
      text: "After rebase",
    },
    {
      type: "paragraph",
      id: "after-question",
      text: "Now your feature sits on top of the newest main. One straight line.",
    },
    {
      type: "gitGraph",
      id: "visual-after",
      title: "After rebase",
      width: 380,
      height: 70,
      commits: [
        { id: "c1", x: 30, y: 24, lane: 0, message: "c1" },
        { id: "c2", x: 110, y: 24, lane: 0, message: "c2 (main)" },
        { id: "f1", x: 190, y: 24, lane: 0, message: "f1" },
        { id: "f2", x: 270, y: 24, lane: 0, message: "f2 (feature)" },
      ],
      lines: [
        { id: "straight-line", points: [{ x: 30, y: 24 }, { x: 110, y: 24 }, { x: 190, y: 24 }, { x: 270, y: 24 }] },
      ],
    },
    {
      type: "callout",
      id: "after-connect",
      tone: "success",
      title: "One straight line",
      text: "c2 is main's newest. Your commits now sit right after it, in order. The knot is gone.",
    },

    // ---------------------------------------------------------------
    // 3 · How to rebase.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-how",
      level: 2,
      text: "How to rebase",
    },
    {
      type: "paragraph",
      id: "how-question",
      text: "Stand on your feature branch and tell Git to lay it onto main.",
    },
    {
      type: "terminalSteps",
      id: "terminal-rebase",
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
          command: "git switch feature",
          output: "Switched to branch 'feature'",
          outputKind: "success",
          note: "Stand on the branch you want to move.",
        },
        {
          command: "git rebase main",
          output: "Successfully rebased feature onto main\nYour branch now sits on top of main.",
          outputKind: "success",
          note: "Git replays your feature commits onto the newest main.",
        },
      ],
    },
    {
      type: "callout",
      id: "how-connect",
      tone: "success",
      title: "Your commits get new hashes",
      text: "Replayed commits get fresh hashes because their parents changed. Same work, new position in history.",
    },

    // ---------------------------------------------------------------
    // 4 · Common mistake.
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
      title: "Rebasing public history",
      text: "Never rebase a branch others already have. Rewriting it changes history they pulled, and their copy will fight yours. Rebase only your own, unpublished work.",
    },

    // ---------------------------------------------------------------
    // 5 · Mini challenge.
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
        "Your feature branch is behind main. What two commands move your work on top of the newest main?",
      hint: "First stand on your branch, then lay it onto main.",
      exampleAnswer:
        "I'd run git switch feature, then git rebase main. My commits get replayed onto the newest main as one straight line.",
    },

    // ---------------------------------------------------------------
    // 6 · What to remember.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-takeaways",
      level: 2,
      text: "What to remember",
    },
    {
      type: "tip",
      id: "tip-rebase",
      title: "Quick tip",
      text: "Rebase is a great move right before a pull request. It gives reviewers one clean line instead of a tangle of merges.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "Rebase replays your commits onto main.",
        "History becomes one straight line.",
        "Replayed commits get new hashes.",
        "Rebase cleans up, merge preserves.",
        "Never rebase shared history.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can lay your work on the newest main now. Next, combine a pile of messy commits into one clean one.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Squashing Commits",
      text: "Learn how to turn five messy commits into one clean commit before a pull request.",
    },
  ],
};
