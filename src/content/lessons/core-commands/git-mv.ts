import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · mv (renaming files)
 *
 * Renaming a file. The engine's `mv` command moves a file in the working
 * tree. Git sees the old name disappear and the new one appear; once you
 * commit, Git can recognize the change as a rename.
 */
export const lessonGitMv: ContentLesson = {
  id: "git-mv",
  slug: "git-mv",
  title: "Renaming Files (mv)",
  description:
    "Renaming a file is like moving it to a new home. Do it with mv, commit it, and Git keeps the file's story intact.",
  meta: {
    module: "core-commands",
    order: 9,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "mv", "rename"],
    summary: [
      "mv renames a file in the working tree.",
      "A rename keeps the file's history.",
      "Git sees the old name disappear and the new one appear.",
      "Staged files stay staged after a rename.",
    ],
    whyItMatters:
      "Renaming is how projects grow up: files change names as their jobs change. Doing it the Git way keeps the file's whole history intact.",
    motivation:
      "You can create, edit, and remove files. Now renaming. One more skill and you own the working tree completely.",
  },
  learningGoals: [
    "Rename a file with mv",
    "See the rename in git status",
    "Understand why renaming keeps history",
  ],
  xpReward: 45,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "notes.txt": "my ideas\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: ["git init", "git add .", 'git commit -m "Start"'],
    objectives: [
      {
        id: "rename",
        label: "Rename notes.txt to ideas.txt with mv",
        checks: [{ kind: "fileNotExists", path: "notes.txt" }, { kind: "fileExists", path: "ideas.txt" }],
      },
      {
        id: "commit-rename",
        label: "Commit the rename",
        checks: [{ kind: "commitCountAtLeast", count: 2 }],
      },
    ],
    hints: [
      "Move the file to its new name with mv notes.txt ideas.txt.",
      "Check git status to see Git noticed the old name is gone and a new one appeared.",
      "Stage and commit the move so your history records it.",
    ],
    solution: ["mv notes.txt ideas.txt", "git status", "git add notes.txt ideas.txt", 'git commit -m "Rename notes to ideas"'],
    suggestions: ["mv notes.txt ideas.txt", "git status", "git add notes.txt ideas.txt"],
    visualizer: { highlight: "working-tree", banner: "Renaming a file keeps its history attached" },
    shell: {
      primaryCommand: "mv notes.txt ideas.txt",
      placeholder: "mv notes.txt ideas.txt",
      quickActions: ["mv notes.txt ideas.txt", "git status", "git add notes.txt ideas.txt"],
      welcomeText: "Give a file a new name.",
      helperText: "notes.txt is tracked. Move it to ideas.txt with mv, then stage and commit the rename.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll be able to rename a file and keep its history attached, so Git remembers what it used to be called.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Imagine you wrote a diary entry and later decided to call it by a better name. Would you throw it away and start over? No. You'd rename it, and it keeps its story.",
    },
    {
      type: "callout",
      id: "why-story",
      tone: "info",
      title: "A book that changed its title",
      text: "A book can be renamed without losing its chapters. The story stays. Renaming a file is the same. Git keeps every change that file has ever had, even after it gets a new name.",
    },

    // ---------------------------------------------------------------
    // 1 · Rename a file.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-rename",
      level: 2,
      text: "Rename a file",
    },
    {
      type: "paragraph",
      id: "rename-question",
      text: "Your project has a file called notes.txt. You want to call it ideas.txt. Move it to its new name.",
    },
    {
      type: "terminalSteps",
      id: "terminal-mv",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "notes.txt": "my ideas\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      setup: ["git add .", 'git commit -m "Start"'],
      steps: [
        {
          command: "mv notes.txt ideas.txt",
          output: "notes.txt → ideas.txt",
          outputKind: "success",
          note: "The file now has a new name. Its contents didn't change.",
        },
        {
          command: "git status",
          output: 'On branch main\n\nChanges not staged for commit:\n\tdeleted:   notes.txt\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tideas.txt',
          outputKind: "muted",
          note: "Git sees the old name is gone and a new one appeared. Stage and commit to record the move.",
        },
      ],
    },
    {
      type: "callout",
      id: "rename-connect",
      tone: "success",
      title: "Same file, new name",
      text: "After the rename, Git sees the old path as deleted and the new path as a new file. Once you commit, Git can recognize that the change looks like a rename, so the file keeps its history instead of looking like a fresh copy.",
    },

    // ---------------------------------------------------------------
    // 2 · Commit the rename.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-commit",
      level: 2,
      text: "Record the move",
    },
    {
      type: "paragraph",
      id: "commit-question",
      text: "Stage the change and commit it so your history knows the file moved.",
    },
    {
      type: "terminalSteps",
      id: "terminal-commit-mv",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "notes.txt": "my ideas\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      setup: ["git add .", 'git commit -m "Start"', "mv notes.txt ideas.txt"],
      steps: [
        {
          command: "git add notes.txt ideas.txt",
          output: "2 files are now staged and ready for their snapshot.",
          outputKind: "success",
          note: "Staging the old name and the new name records the move.",
        },
        {
          command: 'git commit -m "Rename notes to ideas"',
          output: "[main 42c3d09] Rename notes to ideas\n 2 files changed",
          outputKind: "success",
          note: "Committed, Git can recognize the change as a clean rename instead of a delete and an add.",
        },
      ],
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
      title: "Renaming by copy-and-delete",
      text: "Some people copy a file to a new name, then delete the old one. Git treats that as a brand new file with no history. Renaming with mv keeps the story attached. Always move, never copy-and-delete.",
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
        "Why is renaming with mv better than copy-and-delete for your Git history?",
      hint: "What does mv keep that copy-and-delete throws away?",
      exampleAnswer:
        "mv keeps the file's history attached, so Git sees a move instead of a new file with no past. Copy-and-delete makes Git think it's a brand new file, losing the old file's story.",
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
      id: "tip-mv",
      title: "Quick tip",
      text: "Run mv, then git status to confirm the move looks right, then commit. A staged file stays staged through a rename.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "mv renames a file in the working tree.",
        "A rename keeps the file's history.",
        "Git recognizes the committed change as a rename.",
        "Commit the move so history stays clean.",
        "Never copy-and-delete when you can mv.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can create, edit, and rename files. One last skill for keeping your project tidy: telling Git what to ignore.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: .gitignore",
      text: "Learn how to keep secrets and junk out of your history with a tiny file called .gitignore.",
    },
  ],
};
