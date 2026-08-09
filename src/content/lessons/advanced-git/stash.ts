import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git stash
 *
 * You're mid-change and must switch branches, but the work isn't finished.
 * Committing would make a messy half-done snapshot. git stash tucks the work
 * aside so you can switch freely, then brings it back whenever you're ready.
 */
export const lessonGitStash: ContentLesson = {
  id: "stash",
  slug: "stash",
  title: "git stash",
  description:
    "Need to switch branches with half-finished work in your hands? git stash sets it aside and gives it back later, without a messy commit.",
  meta: {
    module: "advanced-git",
    order: 1,
    difficulty: "intermediate",
    durationMinutes: 9,
    tags: ["advanced-git", "stash"],
    summary: [
      "git stash sets your changes aside.",
      "It's not a commit, it's a shelf.",
      "Switch branches freely while stashed.",
      "git stash pop brings the work back.",
    ],
    whyItMatters:
      "Stash is the answer to the most awkward moment in Git: needing to switch branches with work in progress. It's the shelf next to your desk.",
    motivation:
      "You can set work aside and pick it up anytime now. Next, you'll learn to copy a single commit from another branch.",
  },
  learningGoals: [
    "Explain what stash is for",
    "Save work with git stash",
    "List stashes",
    "Restore work with git stash pop",
  ],
  xpReward: 45,
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
      "git switch -c feature",
      "echo 'build plan' > plan.txt",
      "git add .",
      'git commit -m "Plan the feature"',
      "git switch main",
    ],
    objectives: [
      {
        id: "half-done",
        label: "Add a half-finished change to app.js",
        checks: [{ kind: "fileContent", path: "app.js", contains: "WIP" }],
      },
      {
        id: "stash",
        label: "Set it aside with git stash",
        checks: [{ kind: "stashCountAtLeast", count: 1 }, { kind: "ranCommand", contains: "git stash" }],
      },
      {
        id: "pop",
        label: "Switch branches and bring the work back",
        checks: [
          { kind: "stashEmpty" },
          { kind: "fileContent", path: "app.js", contains: "WIP" },
          { kind: "ranCommand", contains: "git stash pop" },
        ],
      },
    ],
    hints: [
      "Add a line to app.js, for example: echo 'const wip = 1; // WIP' >> app.js",
      "Set it aside with git stash. Your tree goes back to the last commit.",
      "Look at the shelf with git stash list, then switch to feature with git switch feature.",
      "Come back to main and bring your work back with git stash pop.",
    ],
    solution: [
      "echo 'const wip = 1; // WIP' >> app.js",
      "git add .",
      "git stash",
      "git stash list",
      "git switch feature",
      "git switch main",
      "git stash pop",
    ],
    suggestions: ["echo 'const wip = 1; // WIP' >> app.js", "git stash", "git stash list", "git switch feature", "git stash pop"],
    visualizer: { highlight: "working-tree", banner: "git stash sets your work aside so you can switch branches freely" },
    shell: {
      primaryCommand: "git stash",
      placeholder: "git stash",
      quickActions: ["git add .", "git stash", "git stash list", "git switch feature", "git stash pop"],
      welcomeText: "Set your work on the shelf.",
      helperText: "Make a change, stash it, switch branches, then pop it back.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll set unfinished work aside, switch branches calmly, and bring your work back whenever you're ready.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You're halfway through editing when your teammate asks you to look at another branch right now. But your work isn't finished, and you don't want a messy commit.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "The shelf next to your desk",
      text: "Think of a shelf. When your desk is too crowded, you put papers on the shelf and grab them again later. git stash is that shelf. Your changes sit safely aside while you switch branches.",
    },

    // ---------------------------------------------------------------
    // 1 · Stash vs commit.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-stash-vs-commit",
      level: 2,
      text: "Stash vs commit",
    },
    {
      type: "paragraph",
      id: "stash-vs-commit-question",
      text: "A commit saves finished work into history. A stash saves work-in-progress onto a shelf. The difference matters.",
    },
    {
      type: "callout",
      id: "stash-vs-commit-connect",
      tone: "success",
      title: "One saves the story, the other saves a pause",
      text: "A commit says \"this part of the story is done.\" A stash says \"I paused here and will continue.\" Commit finished work, stash work that's still in your hands.",
    },

    // ---------------------------------------------------------------
    // 2 · Save work.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-save",
      level: 2,
      text: "Save work with git stash",
    },
    {
      type: "paragraph",
      id: "save-question",
      text: "When your desk is crowded, put the papers on the shelf. git stash does exactly that with your changes.",
    },
    {
      type: "terminalSteps",
      id: "terminal-stash",
      title: "panda-shell",
      prompt: "$",
      seedId: "stash-save",
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
        "echo '// wip' >> app.js",
        "git add .",
      ],
      steps: [
        {
          command: "git stash",
          output: "Saved working directory and index state WIP on main: WIP on main\nWork is safely set aside.",
          outputKind: "success",
          note: "Your changes leave the working tree and sit on the shelf.",
        },
        {
          command: "git stash list",
          output: "stash@{0}: WIP on main",
          outputKind: "output",
          note: "The shelf keeps a list, so you never lose track of what you put aside.",
        },
      ],
    },
    {
      type: "callout",
      id: "save-connect",
      tone: "success",
      title: "Your tree is clean again",
      text: "After stashing, the working tree looks just like the last commit. Nothing is lost, and you can switch branches freely.",
    },

    // ---------------------------------------------------------------
    // 3 · Bring it back.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-pop",
      level: 2,
      text: "Bring the work back",
    },
    {
      type: "paragraph",
      id: "pop-question",
      text: "Finished on the other branch? Now grab your papers off the shelf and keep going.",
    },
    {
      type: "terminalSteps",
      id: "terminal-pop",
      title: "panda-shell",
      prompt: "$",
      seedId: "stash-pop",
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
        "echo '// wip' >> app.js",
        "git add .",
        "git stash",
      ],
      steps: [
        {
          command: "git stash pop",
          output: "Dropped stash@{0} (WIP on main)\nWork is back in your working tree.",
          outputKind: "success",
          note: "The changes return to your working tree, and the shelf item is gone.",
        },
      ],
    },
    {
      type: "callout",
      id: "pop-connect",
      tone: "success",
      title: "Pop removes it from the shelf",
      text: "git stash pop restores the changes AND takes them off the shelf. Your work is exactly where you left it.",
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
      title: "Forgetting stashes exist",
      text: "A stash is easy to forget. It's not a commit, so it's not in your history. Check git stash list when you wonder where work went. Better yet, pop it as soon as you're ready.",
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
        "Your changes are half-finished and you must switch branches. What two commands save your work now and bring it back later?",
      hint: "One saves to the shelf, one takes it off the shelf.",
      exampleAnswer:
        "I'd run git stash before switching branches, and git stash pop when I come back. The stash holds my work safely between them.",
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
      id: "tip-stash",
      title: "Quick tip",
      text: "Forgetting what you stashed? git stash list shows everything on the shelf. It's your memory for work-in-progress.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git stash sets your changes aside.",
        "It's a shelf, not a commit.",
        "You can switch branches while stashed.",
        "git stash pop brings the work back.",
        "Check git stash list if you forget.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can set work aside and pick it up anytime. Next, you'll learn to copy one commit from another branch without merging everything.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git cherry-pick",
      text: "Learn how to grab one commit from another branch and bring it home.",
    },
  ],
};
