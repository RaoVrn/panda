import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git remote
 *
 * A remote is a saved address for another copy of your repository. You give
 * it a name (usually origin) so you can say "send my work to origin".
 */
export const lessonGitRemote: ContentLesson = {
  id: "git-remote",
  slug: "git-remote",
  title: "git remote",
  description:
    "A remote is a saved address for another copy of your project. Name it, look at it, and use it to push and pull.",
  meta: {
    module: "remote-repositories",
    order: 2,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["remote", "github"],
    summary: [
      "A remote is a saved address for another repository.",
      "origin is the default name for your main remote.",
      "git remote add connects a remote.",
      "git remote -v shows your saved addresses.",
    ],
    whyItMatters:
      "Before you can push or pull, Git needs to know where the other copy lives. A remote is that address, stored once and used forever.",
    motivation:
      "Your project has an address now. Next, you'll copy a whole project down from a remote with git clone.",
  },
  learningGoals: [
    "Explain what a remote is",
    "Add a remote with git remote add",
    "Inspect remotes with git remote -v",
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
        files: { "README.md": "My project\n" },
      },
    },
    setup: ["git init", "git add .", 'git commit -m "Start"'],
    objectives: [
      {
        id: "add",
        label: "Add a remote for your project",
        checks: [{ kind: "remoteExists", name: "origin" }],
      },
      {
        id: "rename",
        label: "Rename the remote to upstream",
        checks: [{ kind: "remoteExists", name: "upstream" }, { kind: "remoteNotExists", name: "origin" }],
      },
      {
        id: "inspect",
        label: "Inspect your remotes",
        checks: [
          { kind: "remoteExists", name: "upstream" },
          { kind: "ranCommand", contains: "git remote -v" },
        ],
      },
    ],
    hints: [
      "Add your address with git remote add origin github/my-project.",
      "Rename it with git remote rename origin upstream.",
      "Look at the result with git remote -v.",
    ],
    solution: [
      "git remote add origin github/my-project",
      "git remote rename origin upstream",
      "git remote -v",
    ],
    suggestions: ["git remote add origin github/my-project", "git remote -v", "git remote rename origin upstream"],
    visualizer: { highlight: "head", banner: "A remote is a saved address. Git uses it to push and pull" },
    shell: {
      primaryCommand: "git remote add origin github/my-project",
      placeholder: "git remote add",
      quickActions: ["git remote add origin github/my-project", "git remote -v"],
      welcomeText: "Save your project's online address.",
      helperText: "Add a remote named origin, rename it to upstream, then inspect your saved addresses.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll give your project an online address, so Git knows where to push and pull.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You have a project on your computer and a home for it on GitHub. But Git doesn't know they're connected. You need to tell it the address.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Saving a friend's address",
      text: "When you want to visit a friend, you save their address in your phone. You don't type it every time. A remote is that saved address. Git stores it so you can say \"send my work to my friend's house\" without repeating the address.",
    },

    // ---------------------------------------------------------------
    // 1 · The default name: origin.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-origin",
      level: 2,
      text: "Why the name origin?",
    },
    {
      type: "paragraph",
      id: "origin-question",
      text: "The first remote you add is usually called origin. It's just a convention, like naming your home folder Home.",
    },
    {
      type: "callout",
      id: "origin-connect",
      tone: "success",
      title: "A convention, not a rule",
      text: "origin is the nickname we give to the main remote. It is not GitHub itself; it's the name of the saved address that points to it. You can name a remote anything, but everyone names their main one origin, so you instantly know which copy is the main one.",
    },

    // ---------------------------------------------------------------
    // 2 · Add and inspect.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-commands",
      level: 2,
      text: "Add and inspect",
    },
    {
      type: "paragraph",
      id: "commands-question",
      text: "Two commands: add a remote, then look at your saved addresses.",
    },
    {
      type: "terminalSteps",
      id: "terminal-remote",
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
          command: "git remote add origin github/my-project",
          output: "Added remote origin at github/my-project",
          outputKind: "success",
          note: "Git now knows where your project's home is.",
        },
        {
          command: "git remote -v",
          output: "origin\tgithub/my-project (fetch)\norigin\tgithub/my-project (push)",
          outputKind: "output",
          note: "The -v means verbose: show the full saved addresses.",
        },
      ],
    },
    {
      type: "callout",
      id: "commands-connect",
      tone: "success",
      title: "One address, two jobs",
      text: "Notice the remote shows twice: once for fetch (bringing work in) and once for push (sending work out). Same address, two directions.",
    },

    // ---------------------------------------------------------------
    // 3 · Rename and remove.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-manage",
      level: 2,
      text: "Rename and remove",
    },
    {
      type: "paragraph",
      id: "manage-question",
      text: "Changed your mind about a remote's name, or want to remove it? Git has commands for that too.",
    },
    {
      type: "callout",
      id: "manage-connect",
      tone: "tip",
      title: "git remote rename and remove",
      text: "git remote rename old new changes the name. git remote remove name deletes the saved address. The remote on GitHub stays safe; you're only editing your saved shortcut.",
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
      title: "Forgetting to add the remote",
      text: "You commit work and try to push, but Git says there's no remote. You forgot to add the address first. Run git remote add origin <address>, then push.",
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
        "You try to push, but Git says there's no remote. What do you do?",
      hint: "What command saves the address of your online home?",
      exampleAnswer:
        "I need to add a remote first. I'd run git remote add origin github/my-project, then try to push again. Git needs the address before it can send work anywhere.",
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
      id: "tip-remote",
      title: "Quick tip",
      text: "Run git remote -v anytime to see where your project points. If the address looks wrong, fix it before you push.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "A remote is a saved address for another copy.",
        "origin is the default name for the main remote.",
        "git remote add connects a remote.",
        "git remote -v shows your saved addresses.",
        "Push and pull need a remote first.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Your project has an address now. Next, you'll copy a whole project down from a remote with git clone.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git clone",
      text: "Learn how to copy a repository from a remote onto your computer.",
    },
  ],
};
