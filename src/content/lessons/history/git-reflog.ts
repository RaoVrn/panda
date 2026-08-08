import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git reflog
 *
 * git reflog is Git's memory of everywhere HEAD has been. Even after a
 * branch is deleted or a reset goes wrong, the reflog knows the commit
 * still exists. It's how you recover work that looks gone forever.
 */
export const lessonGitReflog: ContentLesson = {
  id: "git-reflog",
  slug: "git-reflog",
  title: "git reflog",
  description:
    "git reflog remembers everywhere HEAD has been. Deleted a branch? Reset too far? The reflog can lead you back to the work you thought was gone.",
  meta: {
    module: "history",
    order: 6,
    difficulty: "intermediate",
    durationMinutes: 10,
    tags: ["history", "reflog", "recovery"],
    summary: [
      "Reflog records every HEAD move.",
      "It works even after mistakes.",
      "A deleted branch can be recreated.",
      "Reflog is local to your computer.",
    ],
    whyItMatters:
      "Everyone loses work at some point. The reflog is the safety net that brings it back, and knowing it exists makes beginners brave.",
    motivation:
      "You can recover lost work now. That's the end of the History module: from reading your story to surviving your mistakes.",
  },
  learningGoals: [
    "Explain what the reflog is",
    "Read a reflog entry",
    "Recover a deleted branch",
    "Know reflog is local only",
  ],
  xpReward: 55,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "app.js": "line one\nline two\nline three\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      "echo 'const user = getName();' >> app.js",
      "git add .",
      'git commit -m "Add app"',
      "git switch -c old-feature",
      "echo 'feature work' > feature.txt",
      "git add .",
      'git commit -m "Old feature work"',
      "git switch main",
    ],
    objectives: [
      {
        id: "find",
        label: "Spot the old-feature branch",
        checks: [{ kind: "branchExists", name: "old-feature" }],
      },
      {
        id: "delete",
        label: "Delete it (the scary moment)",
        checks: [{ kind: "branchNotExists", name: "old-feature" }],
      },
      {
        id: "recover",
        label: "Bring it back with the reflog",
        checks: [
          { kind: "branchAtCommit", name: "old-feature", hash: "7f2ef9b" },
          { kind: "reflogHas", text: "branch -d old-feature" },
        ],
      },
    ],
    hints: [
      "Find old-feature with git branch.",
      "Delete it with git branch -d old-feature. Don't worry, we're learning recovery.",
      "Run git reflog to see everywhere HEAD has been.",
      "Check out the commit that had your work, then create the branch again.",
    ],
    solution: [
      "git branch",
      "git branch -d old-feature",
      "git reflog",
      "git checkout 7f2ef9b",
      "git switch -c old-feature",
    ],
    suggestions: ["git branch", "git branch -d old-feature", "git reflog", "git switch -c old-feature"],
    visualizer: { highlight: "head", banner: "The reflog remembers where HEAD has been, even after a branch disappears" },
    shell: {
      primaryCommand: "git reflog",
      placeholder: "git reflog",
      quickActions: ["git branch", "git branch -d old-feature", "git reflog"],
      welcomeText: "Recover the lost branch.",
      helperText: "Delete old-feature, then use git reflog to find its commit and bring the branch back.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll rescue work that looked gone forever, using Git's own memory: the reflog.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You finish a project, then realize the file you need was deleted a week ago. Is it really gone?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "A trail of breadcrumbs",
      text: "Think of the reflog as breadcrumbs left behind as you walk. Every time HEAD moves, Git drops a crumb. Lose a branch or reset too far? Follow the crumbs back to where your work still lives.",
    },

    // ---------------------------------------------------------------
    // 1 · What the reflog records.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-what",
      level: 2,
      text: "A diary of every HEAD move",
    },
    {
      type: "paragraph",
      id: "what-question",
      text: "Every time HEAD moves, whether you commit, switch or checkout, Git writes an entry. git reflog lists them, newest first.",
    },
    {
      type: "terminalSteps",
      id: "terminal-reflog",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "index.html": "<h1>hi</h1>\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git reflog",
          output: "79048ff HEAD@{0}: commit: Add login\n3f2ab71 HEAD@{1}: checkout: moving from main to login\n3f2ab71 HEAD@{2}: commit: Add homepage",
          outputKind: "output",
          note: "Each line is a crumb: a commit hash and what HEAD was doing at the time.",
        },
      ],
    },
    {
      type: "callout",
      id: "what-connect",
      tone: "success",
      title: "Reading a crumb",
      text: "The hash on the left is where HEAD was. The text on the right says why. Even if a branch disappears, its commits stay safe in these crumbs.",
    },

    // ---------------------------------------------------------------
    // 2 · The scary moment.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-rescue",
      level: 2,
      text: "The moment a branch disappears",
    },
    {
      type: "paragraph",
      id: "rescue-question",
      text: "You delete a branch and panic. But the commits are not gone. The reflog knows the commit that branch pointed to.",
    },
    {
      type: "callout",
      id: "rescue-connect",
      tone: "tip",
      title: "The recovery path",
      text: "Read the reflog, find the commit the branch used to point at, check it out, and create the branch again. Your work is back, like finding the right page with a crumb.",
    },

    // ---------------------------------------------------------------
    // 3 · Local only.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-local",
      level: 2,
      text: "Your crumbs stay on your computer",
    },
    {
      type: "paragraph",
      id: "local-question",
      text: "The reflog lives only on your machine. Teammates can't see it, and it won't help with remote work.",
    },
    {
      type: "callout",
      id: "local-connect",
      tone: "warning",
      title: "Local safety net",
      text: "The reflog is a local safety net, like notes written in your own margin. A teammate's copy has its own reflog, and a remote server has none of yours.",
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
      title: "Thinking the reflog is shared",
      text: "The reflog is local only. It cannot find work that never existed on your computer, and teammates can't read it. Use it for your own recovery, not collaboration.",
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
        "You deleted a branch by accident. How do you find the commit it pointed to, and how do you bring the branch back?",
      hint: "The reflog remembers every HEAD move.",
      exampleAnswer:
        "I run git reflog, find the commit the branch pointed to, check it out, and create the branch again with git switch -c. The work was never lost.",
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
      id: "tip-reflog",
      title: "Quick tip",
      text: "Scared something is gone? Don't hunt through old chats. Run git reflog first. It's Git's own memory of where everything was.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "The reflog records every HEAD move.",
        "It keeps working even after mistakes.",
        "A deleted branch can be recreated from it.",
        "The reflog is local to your computer.",
        "Git rarely forgets your work.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can rescue lost work now. That's the end of the History module: from reading your story to surviving your mistakes.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Branching",
      text: "You can explore history without fear. Now learn how to work on several paths at once with branches.",
    },
  ],
};
