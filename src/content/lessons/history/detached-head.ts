import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Detached HEAD
 *
 * Detached HEAD sounds scary, but it just means HEAD points straight at a
 * commit instead of a branch. Nothing is lost. This lesson teaches how to
 * explore safely and come back.
 */
export const lessonDetachedHead: ContentLesson = {
  id: "detached-head",
  slug: "detached-head",
  title: "Detached HEAD",
  description:
    "Detached HEAD sounds scary, but you're always safe. It just means HEAD points at a commit, not a branch. Here's how to explore and return.",
  meta: {
    module: "history",
    order: 3,
    difficulty: "intermediate",
    durationMinutes: 9,
    tags: ["history", "head", "detached"],
    summary: [
      "Detached HEAD points at a commit, not a branch.",
      "You haven't lost anything.",
      "Explore safely, then switch back to a branch.",
      "Create a branch to keep detached work.",
    ],
    whyItMatters:
      "Everyone hits a detached HEAD eventually. Knowing it's safe, and knowing how to return, turns a scary moment into a normal one.",
    motivation:
      "You can explore history safely now. Next, you'll learn to look inside a single commit with git show.",
  },
  learningGoals: [
    "Recognize a detached HEAD",
    "Explore a commit safely",
    "Create a branch to keep work",
    "Return to a branch",
  ],
  xpReward: 50,
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
      'echo "<h1>home</h1>" > index.html',
      "git add .",
      'git commit -m "Add homepage"',
      "touch login.js",
      "git add .",
      'git commit -m "Add login"',
    ],
    objectives: [
      {
        id: "detach",
        label: "Enter detached HEAD at an old commit",
        checks: [{ kind: "detachedHead" }],
      },
      {
        id: "create-branch",
        label: "Create a branch to keep this spot",
        checks: [{ kind: "branchExists", name: "explore" }],
      },
      {
        id: "return",
        label: "Return safely to main",
        checks: [{ kind: "branch", name: "main" }, { kind: "ranCommand", contains: "git switch main" }],
      },
    ],
    hints: [
      "Find an older commit with git log --oneline.",
      "Check it out with git checkout <hash> to detach HEAD.",
      "Create a branch at this spot with git switch -c explore.",
      "Return to main with git switch main.",
    ],
    solution: [
      "git log --oneline",
      "git checkout 2271f37",
      "git switch -c explore",
      "git switch main",
    ],
    suggestions: ["git log --oneline", "git switch -c explore", "git switch main"],
    visualizer: { highlight: "head", banner: "Detached HEAD is safe. Explore, keep your spot, and step back to a branch" },
    shell: {
      primaryCommand: "git checkout",
      placeholder: "git checkout",
      quickActions: ["git log --oneline", "git switch -c explore", "git switch main"],
      welcomeText: "Try detached HEAD safely.",
      helperText: "Check out an old commit to detach, make a branch to keep your spot, then return to main.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson a detached HEAD won't scare you. You'll explore, keep your work, and step back to a branch with total confidence.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Imagine you take a bookmark off a page and set it on the table. The bookmark is still yours. You just moved it somewhere unusual.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "A bookmark on the table",
      text: "Normally HEAD sits on a branch, like a bookmark in a book. A detached HEAD is the bookmark set on a specific page, not inside the book's spine. The page is still there. Nothing is lost.",
    },

    // ---------------------------------------------------------------
    // 1 · What detached means.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-what",
      level: 2,
      text: "What does detached mean?",
    },
    {
      type: "paragraph",
      id: "what-question",
      text: "Normally HEAD points at a branch, and the branch points at a commit. Detached means HEAD points straight at a commit, skipping the branch.",
    },
    {
      type: "callout",
      id: "what-connect",
      tone: "success",
      title: "Two pictures of HEAD",
      text: "Normally: HEAD points to a branch, and the branch points to the latest commit. Detached: HEAD points straight at one specific commit, with no branch in between. That's the only difference. Your commits and files are all still there, and you are safe.",
    },

    // ---------------------------------------------------------------
    // 2 · Get in and get out.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-travel",
      level: 2,
      text: "Explore and return",
    },
    {
      type: "paragraph",
      id: "travel-question",
      text: "You can check out an old commit to look around. When you're done, just switch back to a branch.",
    },
    {
      type: "terminalSteps",
      id: "terminal-detached",
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
      setup: [
        "git init",
        "git add .",
        'git commit -m "Start project"',
        'echo "<h1>home</h1>" > index.html',
        "git add .",
        'git commit -m "Add homepage"',
        "touch login.js",
        "git add login.js",
        'git commit -m "Add login"',
      ],
      steps: [
        {
          command: "git checkout 2271f37",
          output: "HEAD is now at 2271f37",
          outputKind: "success",
          note: "HEAD is detached, sitting on an older commit. You're just looking.",
        },
        {
          command: "git switch main",
          output: "Switched to branch 'main'",
          outputKind: "success",
          note: "And you're back. HEAD is on a branch again. Easy.",
        },
      ],
    },
    {
      type: "callout",
      id: "travel-connect",
      tone: "success",
      title: "Two commands, no panic",
      text: "To get into a detached HEAD, check out a commit. To get out, switch to a branch. That's the whole journey, and nothing was ever at risk.",
    },

    // ---------------------------------------------------------------
    // 3 · Keep detached work.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-keep",
      level: 2,
      text: "Keep work you made while detached",
    },
    {
      type: "paragraph",
      id: "keep-question",
      text: "What if you commit while detached, then want to keep that commit? Create a branch at your current spot.",
    },
    {
      type: "callout",
      id: "keep-connect",
      tone: "tip",
      title: "The rescue command",
      text: "git switch -c keep-this creates a branch right where HEAD is, keeping all your detached work. Now nothing can be lost, because that work belongs to a branch.",
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
      title: "Panicking at the message",
      text: "When Git prints \"you are in detached HEAD state\", it sounds scary. It's not. You haven't lost anything. Just switch to a branch, or make a branch to keep your work.",
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
        "You're detached and made a commit you want to keep. What single command keeps it safe?",
      hint: "It creates a branch where HEAD is.",
      exampleAnswer:
        "I'd run git switch -c keep-this. It creates a branch at my current commit, so my detached work is now safely on a branch.",
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
      id: "tip-detached",
      title: "Quick tip",
      text: "See \"detached HEAD\"? Just run git switch <branch> to land safely. One command, back to normal.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "Detached HEAD points at a commit, not a branch.",
        "You haven't lost anything.",
        "git switch <branch> returns you safely.",
        "git switch -c <name> keeps detached work.",
        "Detached HEAD is a normal, safe situation.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can explore history safely now. Next, let's look inside a single commit and see exactly what it changed.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git show",
      text: "Learn how to open one saved snapshot and read what's inside.",
    },
  ],
};
