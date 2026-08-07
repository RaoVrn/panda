import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git clone
 *
 * Cloning copies a whole repository from a remote onto your computer, with
 * all its history. It's the right way to start from someone else's project.
 */
export const lessonGitClone: ContentLesson = {
  id: "git-clone",
  slug: "git-clone",
  title: "git clone",
  description:
    "git clone copies a whole project from a remote onto your computer, history and all. It's how you start working on someone else's code.",
  meta: {
    module: "remote-repositories",
    order: 3,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["remote", "clone"],
    summary: [
      "git clone copies a repository from a remote.",
      "A clone comes with the full history.",
      "A ZIP download is just a snapshot, not history.",
      "Cloning sets up the remote automatically.",
    ],
    whyItMatters:
      "Starting a new project? You rarely write it from scratch. You clone an existing one and build on it. Cloning is how every team member gets the code.",
    motivation:
      "You can pull a project down now. Next, you'll bring new changes from the remote into your local copy.",
  },
  learningGoals: [
    "Clone a repository with git clone",
    "Know how cloning differs from downloading a ZIP",
    "Understand a clone comes with history",
  ],
  xpReward: 45,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
      },
      pwd: "~/project",
      initialized: true,
      remote: {
        pwd: "github/my-project",
        initialized: true,
        files: {
          "README.md": "My project\n",
          "index.html": "<h1>hi</h1>\n",
          "src/main.js": "console.log('hi');\n",
        },
      },
    },
    objectives: [
      {
        id: "clone",
        label: "Clone the remote project",
        checks: [{ kind: "fileExists", path: "src/main.js" }, { kind: "fileExists", path: "index.html" }],
      },
      {
        id: "remote-ready",
        label: "Confirm the remote is set up",
        checks: [{ kind: "remoteExists", name: "origin" }],
      },
      {
        id: "explore",
        label: "Look at the files with ls",
        checks: [{ kind: "fileExists", path: "README.md" }],
      },
    ],
    hints: [
      "Copy the whole project with git clone github/my-project my-project.",
      "A clone sets up the remote automatically, usually named origin.",
      "Run ls to see the files that came with it.",
    ],
    solution: ["git clone github/my-project my-project", "ls"],
    suggestions: ["git clone github/my-project my-project", "ls"],
    visualizer: { highlight: "head", banner: "git clone copies the whole project, history included" },
    shell: {
      primaryCommand: "git clone github/my-project my-project",
      placeholder: "git clone",
      quickActions: ["git clone github/my-project my-project", "ls"],
      welcomeText: "Pull a whole project down.",
      helperText: "The remote has a project ready. Clone it, then explore the files you got.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll copy a whole project from a remote, with its history, and understand why that's better than a download.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "A friend built a project on GitHub and wants you to join. How do you get the whole thing, history included, onto your computer?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Borrowing a filled notebook",
      text: "A ZIP download is like borrowing just the last page of a friend's notebook. A clone is like borrowing the whole notebook, every page, every version they ever wrote. Now you can read the whole story and add your own page.",
    },

    // ---------------------------------------------------------------
    // 1 · Clone vs download.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-vs",
      level: 2,
      text: "Clone vs download",
    },
    {
      type: "paragraph",
      id: "vs-question",
      text: "GitHub has a Download ZIP button. Why not just use that?",
    },
    {
      type: "callout",
      id: "vs-connect",
      tone: "warning",
      title: "A ZIP is only today",
      text: "A ZIP download gives you the files as they are right now, with no history and no connection to the remote. A clone gives you every snapshot and a ready-made remote, so you can push changes straight back.",
    },

    // ---------------------------------------------------------------
    // 2 · Clone it.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-clone",
      level: 2,
      text: "Run the clone",
    },
    {
      type: "paragraph",
      id: "clone-question",
      text: "Cloning is one command. Git copies the repository into a new folder, history and all.",
    },
    {
      type: "terminalSteps",
      id: "terminal-clone",
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
          command: "git clone github/my-project my-project",
          output: "Cloning into 'my-project'...\nDone.",
          outputKind: "success",
          note: "Git copied the whole project into a folder called my-project.",
        },
        {
          command: "ls",
          output: "README.md  index.html  src",
          outputKind: "output",
          note: "All the remote's files are here, ready to work on.",
        },
      ],
    },
    {
      type: "callout",
      id: "clone-connect",
      tone: "success",
      title: "A ready-made setup",
      text: "A clone isn't just files. It comes with the full history and the remote already connected, named origin. You can start committing and pushing right away.",
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
      title: "Cloning into an existing folder",
      text: "git clone creates a new folder for the project. If you clone into a folder that already has files, Git may refuse or mix things up. Clone into a fresh, empty spot.",
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
        "Why is a clone better than downloading a ZIP for joining a project?",
      hint: "What does a ZIP leave out? What does a clone set up automatically?",
      exampleAnswer:
        "A ZIP is just today's files. A clone has the whole history and the remote already connected, so I can push my changes straight back to the team.",
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
      id: "tip-clone",
      title: "Quick tip",
      text: "After cloning, run git remote -v to confirm the remote is set up. It usually is, named origin, ready to go.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git clone copies a repository to your computer.",
        "A clone includes the full history.",
        "A ZIP download is just a snapshot.",
        "A clone sets up the remote for you.",
        "Clone into a fresh folder.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can bring a project down now. Next, you'll bring new changes from the remote into your local copy, without touching your own work.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git fetch",
      text: "Learn how to check what's new on the remote, without changing your work.",
    },
  ],
};
