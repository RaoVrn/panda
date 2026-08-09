import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · HEAD
 *
 * HEAD is Git's bookmark. It marks where you are right now, like a red dot
 * on a map. Don't fear it. It just tells Git which branch you're on.
 */
export const lessonHead: ContentLesson = {
  id: "head",
  slug: "head",
  title: "HEAD",
  description:
    "HEAD is Git's bookmark. It marks where you are right now, so Git knows which branch your next snapshot belongs to.",
  meta: {
    module: "history",
    order: 2,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["history", "head"],
    summary: [
      "HEAD is a pointer to where you are.",
      "It points at your current branch.",
      "Your next commit lands wherever HEAD points.",
      "HEAD is safe and simple to understand.",
    ],
    whyItMatters:
      "Almost every Git command moves HEAD. Understanding it means you always know where your work will go.",
    motivation:
      "You know where you are in history now. Next, the one situation that scares everyone: a detached HEAD.",
  },
  learningGoals: [
    "Explain what HEAD is",
    "Know what HEAD points at",
    "Move HEAD between branches",
  ],
  xpReward: 45,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "index.html": "<h1>hi</h1>\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      "git switch -c feature",
      "touch feature.txt",
      "git add .",
      'git commit -m "Work on feature"',
      "git switch main",
    ],
    objectives: [
      {
        id: "move",
        label: "Move HEAD onto feature",
        checks: [{ kind: "branch", name: "feature" }, { kind: "fileExists", path: "feature.txt" }],
      },
      {
        id: "return",
        label: "Return HEAD to main",
        checks: [{ kind: "branch", name: "main" }, { kind: "reflogHas", text: "switch: moving to feature" }],
      },
    ],
    hints: [
      "Check where HEAD is with git branch. The star shows it.",
      "Move HEAD onto feature with git switch feature.",
      "Come back to main with git switch main.",
    ],
    solution: ["git branch", "git switch feature", "git switch main"],
    suggestions: ["git branch", "git switch feature", "git switch main"],
    visualizer: { highlight: "head", banner: "HEAD is the bookmark that follows you between branches" },
    shell: {
      primaryCommand: "git switch feature",
      placeholder: "git switch",
      quickActions: ["git branch", "git switch feature", "git switch main"],
      welcomeText: "Watch HEAD move.",
      helperText: "Move HEAD onto feature, then back to main. Watch it follow you.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson HEAD won't be scary at all. You'll know it's just a bookmark showing where you are.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You're reading a long book and want to remember your page. What do you use? A bookmark.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "The bookmark called HEAD",
      text: "HEAD is Git's bookmark. It marks the exact spot you're on right now. When you switch branches, HEAD moves with you. It's never lost, never broken, just a pointer.",
    },

    // ---------------------------------------------------------------
    // 1 · What HEAD points at.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-what",
      level: 2,
      text: "What HEAD points at",
    },
    {
      type: "paragraph",
      id: "what-question",
      text: "In Git, HEAD points at your current branch. And your branch points at your latest commit. So HEAD → branch → latest snapshot.",
    },
    {
      type: "callout",
      id: "what-connect",
      tone: "success",
      title: "The chain",
      text: "HEAD points to a branch, and the branch points to a commit. Your next commit attaches to that branch, exactly where you left off.",
    },

    // ---------------------------------------------------------------
    // 2 · See HEAD move.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-move",
      level: 2,
      text: "Watch HEAD move",
    },
    {
      type: "paragraph",
      id: "move-question",
      text: "You have two branches. Switch between them and watch HEAD follow you, like a bookmark sliding between chapters.",
    },
    {
      type: "terminalSteps",
      id: "terminal-head",
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
          command: "git branch",
          output: "* main",
          outputKind: "output",
          note: "The star marks your branch. HEAD is here, on main.",
        },
        {
          command: "git switch -c feature",
          output: "Switched to a new branch 'feature'",
          outputKind: "success",
          note: "HEAD moved onto the new branch, like a bookmark sliding to a new page.",
        },
        {
          command: "git branch",
          output: "  main\n* feature",
          outputKind: "output",
          note: "Now the star is on feature. HEAD followed you.",
        },
      ],
    },
    {
      type: "callout",
      id: "move-connect",
      tone: "success",
      title: "HEAD is just following",
      text: "You didn't create anything new. HEAD simply moved from main to feature. Your next commit will land on feature, because that's where HEAD is.",
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
      title: "Being afraid of HEAD",
      text: "Some beginners panic when they see HEAD. It's just a bookmark. It can't break your work. If HEAD ever seems lost, switching to a branch puts it back.",
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
        "You switch from main to feature. What happens to HEAD, and where will your next commit go?",
      hint: "HEAD is a bookmark. It follows you.",
      exampleAnswer:
        "HEAD moves to feature, like a bookmark sliding to a new page. My next commit lands on feature, because that's where HEAD is pointing.",
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
      id: "tip-head",
      title: "Quick tip",
      text: "Run git branch to see where HEAD is. The star always marks your current spot.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "HEAD is Git's bookmark.",
        "It points at your current branch.",
        "Your next commit lands where HEAD points.",
        "Switching branches moves HEAD.",
        "HEAD is safe and easy to understand.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You know where you are in history now. Next, the one situation that scares everyone: a detached HEAD.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Detached HEAD",
      text: "Learn what happens when HEAD points straight at a commit, and why you're always safe.",
    },
  ],
};
