import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Merging branches
 *
 * Joining two lines of work back together. When your feature is done, you
 * bring its snapshots into main with git merge.
 */
export const lessonMerge: ContentLesson = {
  id: "merge",
  slug: "merge",
  title: "Merging Branches",
  description:
    "When your branch is finished, git merge joins its work back into main, so everyone gets the new feature.",
  meta: {
    module: "branching",
    order: 5,
    difficulty: "beginner",
    durationMinutes: 9,
    tags: ["branching", "merge"],
    summary: [
      "git merge joins one branch into another.",
      "You merge into the branch you're on.",
      "A merge combines the work of two lines.",
      "If Git can join them cleanly, it does.",
    ],
    whyItMatters:
      "Branches are for working apart. Merge is how you bring it all back together. It's the moment your feature becomes real.",
    motivation:
      "You've merged a branch. Next, what happens when Git can't merge automatically, and how to fix it.",
  },
  learningGoals: [
    "Merge a branch into main",
    "Know which branch receives the merge",
    "Understand why merging brings work together",
  ],
  xpReward: 50,
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
      "git switch -c add-cart",
      "touch cart.js",
      "git add .",
      'git commit -m "Add the cart"',
      "git switch main",
    ],
    objectives: [
      {
        id: "on-main",
        label: "Stand on main",
        checks: [{ kind: "branch", name: "main" }],
      },
      {
        id: "merge",
        label: "Merge add-cart into main",
        checks: [{ kind: "commitCountAtLeast", count: 2 }, { kind: "branch", name: "main" }],
      },
      {
        id: "see-merged",
        label: "Find the feature in main's history",
        checks: [{ kind: "anyCommitMessage", message: "Add the cart" }],
      },
    ],
    hints: [
      "Make sure you're on main with git switch main.",
      "Bring the feature home with git merge add-cart.",
      "Check the log with git log --oneline to see the cart commit on main.",
    ],
    solution: ["git switch main", "git merge add-cart", "git log --oneline"],
    suggestions: ["git switch main", "git merge add-cart", "git log --oneline"],
    visualizer: { highlight: "head", banner: "git merge brings a finished branch back into main" },
    shell: {
      primaryCommand: "git merge add-cart",
      placeholder: "git merge",
      quickActions: ["git switch main", "git merge add-cart", "git log --oneline"],
      welcomeText: "Merge your branch into main.",
      helperText: "The cart feature is finished on add-cart. Stand on main and merge it in.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll merge a finished branch into main and understand what the merge actually does.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You built a feature on a branch called add-cart. It works. Now you want everyone to have it. How does it get into main?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Gluing two story pages together",
      text: "You wrote the ending of your story on a separate page. When it's done, you glue that page into the main notebook. Merging is that glue. The feature page becomes part of the whole story.",
    },

    // ---------------------------------------------------------------
    // 1 · The merge step.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-merge",
      level: 2,
      text: "Bring the branch home",
    },
    {
      type: "paragraph",
      id: "merge-question",
      text: "To merge, you first stand on the branch you want to keep, usually main. Then you merge the other branch into it.",
    },
    {
      type: "terminalSteps",
      id: "terminal-merge",
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
          command: "git switch main",
          output: "Switched to branch 'main'",
          outputKind: "success",
          note: "You stand on main, the branch that receives the work.",
        },
        {
          command: "git merge add-cart",
          output: "Updating 4a65329..79048ff\nFast-forward",
          outputKind: "success",
          note: "The feature's snapshots joined main. The work is now on your safe branch.",
        },
        {
          command: "git log --oneline",
          output: "79048ff (HEAD -> main) Add the cart\n4a65329 Start project",
          outputKind: "output",
          note: "The feature's commit is now part of main's history.",
        },
      ],
    },
    {
      type: "callout",
      id: "merge-connect",
      tone: "success",
      title: "What just happened",
      text: "Main now has everything the feature branch had. The cart feature is part of your main line of work. That's a merge.",
    },

    // ---------------------------------------------------------------
    // 2 · Which branch receives?
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-direction",
      level: 2,
      text: "Which branch gets the work?",
    },
    {
      type: "paragraph",
      id: "direction-question",
      text: "A common confusion: which branch changes after a merge? The answer is the branch you're standing on.",
    },
    {
      type: "callout",
      id: "direction-connect",
      tone: "info",
      title: "The receiving branch",
      text: "You merge INTO the branch you're on. git merge add-cart while on main means main receives add-cart's work. The add-cart branch stays as it was.",
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
      title: "Merging in the wrong direction",
      text: "If you merge while on the feature branch, the feature receives main, not the other way around. Check the star first. Merge into the branch you want to keep.",
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
        "You're on main and type git merge add-cart. Which branch ends up with the feature's work?",
      hint: "The merge goes into the branch you're standing on.",
      exampleAnswer:
        "Main gets the feature's work, because I'm standing on main. The merge brings add-cart's snapshots into main.",
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
      id: "tip-merge",
      title: "Quick tip",
      text: "Before merging, run git status to make sure your tree is clean. A tidy tree merges without surprises.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git merge joins one branch into another.",
        "You merge INTO the branch you're on.",
        "A merge combines two lines of work.",
        "The receiving branch gets the new snapshots.",
        "Check the star before you merge.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Merges usually go smoothly. But sometimes Git can't decide on its own. That's called a conflict.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Merge conflicts",
      text: "Learn what happens when Git can't merge automatically, and how to fix it calmly.",
    },
  ],
};
