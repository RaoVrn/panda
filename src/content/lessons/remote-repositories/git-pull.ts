import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git pull
 *
 * Pull = fetch + merge. It brings the remote's new work into your branch,
 * updating your files. It's how you get your teammate's changes.
 */
export const lessonGitPull: ContentLesson = {
  id: "git-pull",
  slug: "git-pull",
  title: "git pull",
  description:
    "git pull brings the remote's new work into your branch. It's fetch plus merge, updating your files in one step.",
  meta: {
    module: "remote-repositories",
    order: 5,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["remote", "pull", "fetch", "merge"],
    summary: [
      "git pull fetches and merges new work.",
      "It updates your branch to match the remote.",
      "Pull is the everyday way to get teammate changes.",
      "Check git status before you pull.",
    ],
    whyItMatters:
      "In a team, the remote changes while you work. Pull is how you stay in sync, so your work builds on the latest version.",
    motivation:
      "You can pull in teammate changes now. Next, the other half: sending your own work up with git push.",
  },
  learningGoals: [
    "Pull teammate changes with git pull",
    "Understand pull is fetch plus merge",
    "Keep your branch in sync with the remote",
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
      remote: {
        pwd: "github/my-project",
        initialized: true,
        files: { "README.md": "My project\n", "index.html": "<h1>hi</h1>\n" },
      },
    },
    setup: ["git init", "git add .", 'git commit -m "Start"'],
    remoteSetup: [
      "git init",
      "git add .",
      'git commit -m "Start"',
      "touch team.txt",
      "git add .",
      'git commit -m "Teammate adds file"',
    ],
    objectives: [
      {
        id: "pull",
        label: "Pull the teammate's changes",
        checks: [{ kind: "fileExists", path: "team.txt" }],
      },
      {
        id: "synced",
        label: "Have the teammate's commit in history",
        checks: [{ kind: "anyCommitMessage", message: "Teammate adds file" }],
      },
    ],
    hints: [
      "Check git status to make sure your tree is clean.",
      "Run git pull to bring the teammate's work in.",
      "Look for team.txt and check the log.",
    ],
    solution: ["git pull", "ls", "git log --oneline"],
    suggestions: ["git pull", "git status", "git log --oneline"],
    visualizer: { highlight: "head", banner: "git pull fetches and merges the remote's new work" },
    shell: {
      primaryCommand: "git pull",
      placeholder: "git pull",
      quickActions: ["git pull", "git status"],
      welcomeText: "Pull your teammate's changes.",
      helperText: "A teammate pushed a new file. Pull it so your copy matches the remote.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll pull your teammate's changes into your branch, the way real teams stay in sync.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Your teammate pushed a new file to the project. You want it in your copy. How do you get it?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Updating your notes",
      text: "Your friend sent you an updated version of your shared notes. Fetch showed you it exists. Pull brings it into your notebook, so your copy now matches theirs. Two actions, one command.",
    },

    // ---------------------------------------------------------------
    // 1 · What pull does.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-what",
      level: 2,
      text: "What pull does",
    },
    {
      type: "paragraph",
      id: "what-question",
      text: "Pull is two steps in one: fetch the new work, then merge it into your branch. Your files update to match the remote.",
    },
    {
      type: "callout",
      id: "what-connect",
      tone: "success",
      title: "Fetch plus merge",
      text: "Remember fetch is the safe look. Pull adds the merge, actually bringing the work into your branch. Most days, you just pull and skip the separate fetch.",
    },

    // ---------------------------------------------------------------
    // 2 · Pull in action.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-run",
      level: 2,
      text: "Run the pull",
    },
    {
      type: "paragraph",
      id: "run-question",
      text: "Your teammate pushed a new file. Pull it and see your branch update.",
    },
    {
      type: "terminalSteps",
      id: "terminal-pull",
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
          command: "git pull",
          output: "Updating 4a65329..79048ff\nFast-forward",
          outputKind: "success",
          note: "Your branch moved forward to include your teammate's work.",
        },
        {
          command: "ls",
          output: "README.md  index.html  team.txt",
          outputKind: "output",
          note: "The new file, team.txt, is now in your copy.",
        },
      ],
    },
    {
      type: "callout",
      id: "run-connect",
      tone: "success",
      title: "Your copy caught up",
      text: "Your branch now includes the teammate's commit, and their new file is in your folder. That's pull: your copy now matches the remote.",
    },

    // ---------------------------------------------------------------
    // 3 · Pull when you have your own changes.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-clean",
      level: 2,
      text: "Pull with a clean tree",
    },
    {
      type: "paragraph",
      id: "clean-question",
      text: "Pull goes smoothest when you have no uncommitted changes. If you have your own work in progress, commit it first, then pull.",
    },
    {
      type: "callout",
      id: "clean-connect",
      tone: "warning",
      title: "The golden habit",
      text: "Before pulling, run git status. If your tree is clean, pull sails through. If it's not, commit your work first so nothing gets tangled.",
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
      title: "Pulling with uncommitted work",
      text: "If you pull with uncommitted changes and the remote changed the same files, you can hit a conflict. Commit your work first. A clean tree makes pulls calm.",
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
        "Your teammate pushed a new file. What does git pull do in one step?",
      hint: "It's two things you already know, combined.",
      exampleAnswer:
        "git pull fetches the new work from the remote and merges it into my branch. My copy updates to include the teammate's file, all in one command.",
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
      id: "tip-pull",
      title: "Quick tip",
      text: "Pull before you push. It keeps your branch in sync, so your push lands cleanly on the latest version.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git pull fetches and merges new work.",
        "Your branch updates to match the remote.",
        "Pull is the everyday way to get changes.",
        "Commit your work before you pull.",
        "Pull before you push.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can bring work in now. Next, the other half of the story: sending your own work up with git push.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git push",
      text: "Learn how to upload your commits to the remote, and what to do if Git says no.",
    },
  ],
};
