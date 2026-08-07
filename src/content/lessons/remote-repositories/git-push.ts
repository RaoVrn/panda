import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git push
 *
 * Push uploads your local commits to the remote. It's how your work reaches
 * GitHub and your team. If the remote has work you don't, Git rejects the
 * push until you pull first.
 */
export const lessonGitPush: ContentLesson = {
  id: "git-push",
  slug: "git-push",
  title: "git push",
  description:
    "git push sends your commits to the remote, so your work reaches GitHub and your team. And yes, sometimes it says no. Here's why.",
  meta: {
    module: "remote-repositories",
    order: 6,
    difficulty: "beginner",
    durationMinutes: 9,
    tags: ["remote", "push"],
    summary: [
      "git push uploads your commits to the remote.",
      "Your local copy and the remote are different copies.",
      "Git rejects a push if the remote has work you don't.",
      "Pull first, then push.",
    ],
    whyItMatters:
      "Push is how your work leaves your computer. It's the final step that shares your code, and knowing why pushes get rejected is what makes you a real collaborator.",
    motivation:
      "That's the whole Remote Repositories module. You can share, sync, and collaborate now. You're ready for real projects.",
  },
  learningGoals: [
    "Push commits with git push",
    "Understand local vs remote copies",
    "Fix a rejected push by pulling first",
  ],
  xpReward: 50,
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
    setup: ["git init", "git add .", 'git commit -m "Start"', "git remote add origin github/my-project"],
    remoteSetup: ["git init", "git add .", 'git commit -m "Start"'],
    objectives: [
      {
        id: "commit",
        label: "Make a new commit locally",
        checks: [{ kind: "anyCommitMessage", message: "Add the cart" }],
      },
      {
        id: "push",
        label: "Push your commit to the remote",
        checks: [{ kind: "pushSucceeded" }],
      },
      {
        id: "synced",
        label: "Remote now has your work",
        checks: [{ kind: "anyCommitMessage", message: "Add the cart" }],
      },
    ],
    hints: [
      "Create a file, stage it, and commit with a clear message.",
      "Send your work up with git push.",
      "Check git log to confirm the remote has your commit.",
    ],
    solution: [
      "touch cart.js",
      "git add .",
      'git commit -m "Add the cart"',
      "git push",
    ],
    suggestions: ["git status", "git push", "git log --oneline"],
    visualizer: { highlight: "head", banner: "git push copies your local commits up to the remote" },
    shell: {
      primaryCommand: "git push",
      placeholder: "git push",
      quickActions: ["git status", "git push"],
      welcomeText: "Send your work to the remote.",
      helperText: "Make a commit, then push it up so the remote has your work too.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll push your work to the remote, and know exactly what to do when Git says no.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You finished a feature. It's committed locally. Now you want the whole team to see it. How does your work leave your computer?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Sending your homework to the shared folder",
      text: "You wrote your homework, then drop it in the shared class folder. Push is that drop. Your work leaves your notebook and lands in the shared copy everyone can see.",
    },

    // ---------------------------------------------------------------
    // 1 · Local vs remote.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-local-remote",
      level: 2,
      text: "Local vs remote",
    },
    {
      type: "paragraph",
      id: "local-remote-question",
      text: "You have two copies of the project: your local one on your computer, and the remote one on GitHub. They don't sync by themselves.",
    },
    {
      type: "callout",
      id: "local-remote-connect",
      tone: "success",
      title: "Two notebooks, one story",
      text: "Your local copy is where you work. The remote is the shared copy. Push copies your new commits up, so the remote matches your local. Until you push, the remote is stuck in the past.",
    },

    // ---------------------------------------------------------------
    // 2 · Push in action.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-run",
      level: 2,
      text: "Run the push",
    },
    {
      type: "paragraph",
      id: "run-question",
      text: "Commit a change, then push it up to the remote.",
    },
    {
      type: "terminalSteps",
      id: "terminal-push",
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
          command: "git commit -m \"Add the cart\"",
          output: "[main 79048ff] Add the cart\n 1 file changed",
          outputKind: "success",
          note: "The commit is saved locally. The remote doesn't know yet.",
        },
        {
          command: "git push",
          output: "To the remote\n   ..79048ff  main -> main\n  1 commit pushed.",
          outputKind: "success",
          note: "Your commit reached the remote. Now the team can see it.",
        },
      ],
    },
    {
      type: "callout",
      id: "run-connect",
      tone: "success",
      title: "Your work went public",
      text: "The commit that lived only on your computer now lives on the remote too. Push copied it up. Anyone with access to the remote can see it.",
    },

    // ---------------------------------------------------------------
    // 3 · The rejected push.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-rejected",
      level: 2,
      text: "When Git says no",
    },
    {
      type: "paragraph",
      id: "rejected-question",
      text: "Sometimes your push gets rejected. It's not a bug. Git is protecting the shared history.",
    },
    {
      type: "callout",
      id: "rejected-connect",
      tone: "warning",
      title: "The remote moved without you",
      text: "If a teammate pushed work while you were away, the remote has commits you don't. Pushing would overwrite their work, so Git refuses. The fix is simple: pull first to get their work, then push again.",
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
      title: "Pushing secrets",
      text: "Never push passwords, API keys, or private files. Once a secret is in the remote's history, it's very hard to remove. Check git status before you push, and keep secrets out.",
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
        "Your push was rejected because the remote has work you don't. What's the fix?",
      hint: "Get the remote's work first, then send yours.",
      exampleAnswer:
        "I'd run git pull to bring the remote's new work into my branch, then push again. Now my work builds on top of theirs, and nothing gets overwritten.",
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
      id: "tip-push",
      title: "Quick tip",
      text: "Pull before you push, every time. It keeps your branch in sync and makes rejected pushes a thing of the past.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git push uploads your commits to the remote.",
        "Local and remote are separate copies.",
        "Push is how your work reaches the team.",
        "Git rejects a push if the remote moved first.",
        "Pull first, then push.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "That's the whole Remote Repositories module. You can share, sync, and collaborate now. You're ready for real projects.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "What's next: Advanced Git",
      text: "Next you'll learn the power tools: stash, reset, revert, rebase, and more.",
    },
  ],
};
