import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git rm
 *
 * Removing a file from your project. The working tree and repository both
 * need to know when a file leaves. In the playground you use `rm` to delete
 * a file and Git tracks the deletion.
 */
export const lessonGitRm: ContentLesson = {
  id: "git-rm",
  slug: "git-rm",
  title: "Deleting Files (git rm)",
  description:
    "Files leave projects too. Learn how to remove a file the Git way, so your history knows it's gone.",
  meta: {
    module: "core-commands",
    order: 8,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "rm", "delete"],
    summary: [
      "rm removes a file from the working tree.",
      "Git notices the deletion in status.",
      "Commit the deletion to record it in history.",
      "Deleting a tracked file shows as a change, not a new file.",
    ],
    whyItMatters:
      "Removing a file is part of everyday Git. Knowing how to delete cleanly keeps your history honest and your project tidy.",
    motivation:
      "You can add, change, and now delete files. Next up: renaming them without losing their history.",
  },
  learningGoals: [
    "Delete a file with rm",
    "See the deletion in git status",
    "Commit a deletion",
  ],
  xpReward: 45,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "old-notes.txt": "old ideas\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: ["git init", "git add .", 'git commit -m "Start"'],
    objectives: [
      {
        id: "delete",
        label: "Delete old-notes.txt with rm",
        checks: [{ kind: "fileNotExists", path: "old-notes.txt" }],
      },
      {
        id: "stage-delete",
        label: "Stage the deletion",
        checks: [{ kind: "fileStaged", path: "old-notes.txt" }],
      },
      {
        id: "commit-delete",
        label: "Commit the deletion",
        checks: [{ kind: "commitCountAtLeast", count: 2 }],
      },
    ],
    hints: [
      "Delete the file with rm old-notes.txt, then check git status.",
      "Git will show the deletion as a change. Stage it with git add.",
      "Commit it with git commit -m so your history records the removal.",
    ],
    solution: ["rm old-notes.txt", "git status", "git add old-notes.txt", 'git commit -m "Remove old notes"'],
    suggestions: ["rm old-notes.txt", "git status", "git add old-notes.txt"],
    visualizer: { highlight: "working-tree", banner: "Deleting a file is just another change Git records" },
    shell: {
      primaryCommand: "rm old-notes.txt",
      placeholder: "rm old-notes.txt",
      quickActions: ["rm old-notes.txt", "git status", "git add ."],
      welcomeText: "Remove a file the Git way.",
      helperText: "old-notes.txt is tracked. Delete it with rm, then stage and commit the deletion.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll be able to remove a file from your project and record it in your history, the same way developers do every day.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "A project is like a closet. Sometimes you need to take something out. A file you no longer need should leave, and Git should remember it left.",
    },
    {
      type: "callout",
      id: "why-story",
      tone: "info",
      title: "Cleaning your room",
      text: "When you clean your room, you throw away things you don't need. But you'd want a note in your diary about what you threw away and when. Git is that diary. Removing a file is just another change it records.",
    },

    // ---------------------------------------------------------------
    // 1 · Delete a file.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-delete",
      level: 2,
      text: "Delete a file",
    },
    {
      type: "paragraph",
      id: "delete-question",
      text: "In your project, you have a file called old-notes.txt that you don't need anymore. Remove it.",
    },
    {
      type: "terminalSteps",
      id: "terminal-rm",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "old-notes.txt": "old ideas\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "rm old-notes.txt",
          output: "removed old-notes.txt",
          outputKind: "success",
          note: "The file is gone from your working tree.",
        },
        {
          command: "git status",
          output: "On branch main\nChanges not staged for commit:\n\tdeleted:   old-notes.txt",
          outputKind: "muted",
          note: "Git noticed the file left. A deletion is just another change.",
        },
      ],
    },
    {
      type: "callout",
      id: "delete-connect",
      tone: "success",
      title: "Git saw it happen",
      text: "You didn't just delete a file. Git recorded it as a deletion, ready to be committed. Your history will know this file existed, and when it left.",
    },

    // ---------------------------------------------------------------
    // 2 · Commit the deletion.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-commit",
      level: 2,
      text: "Record it in history",
    },
    {
      type: "paragraph",
      id: "commit-question",
      text: "A deletion is a change like any other. Stage it and commit it so your history knows the file is gone.",
    },
    {
      type: "terminalSteps",
      id: "terminal-commit-rm",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "old-notes.txt": "old ideas\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add old-notes.txt",
          output: "old-notes.txt is now staged and ready for its snapshot.",
          outputKind: "success",
          note: "Staging a deleted file records the deletion.",
        },
        {
          command: 'git commit -m "Remove old notes"',
          output: "[main 3f2ab71] Remove old notes\n 1 file changed, 1 deletion(-)",
          outputKind: "success",
          note: "Your history now records the file's last goodbye.",
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
      title: "Deleting but never committing",
      text: "If you delete a file but forget to commit, Git still sees it as deleted in the working tree. But your history still shows the file. Commit the deletion so your history and your folder agree.",
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
        "You deleted a file with rm. What two more steps turn that into part of your history?",
      hint: "One step records the change, one step saves the snapshot.",
      exampleAnswer:
        "I'd stage the deletion with git add, then commit it with git commit -m. That way the removal becomes part of my history, not just a change in the working tree.",
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
      id: "tip-rm",
      title: "Quick tip",
      text: "After deleting a file, run git status to see the deletion, then commit it. A clean history has no mystery deletions.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "rm removes a file from the working tree.",
        "Git shows the deletion in git status.",
        "Stage and commit the deletion.",
        "Deletions are recorded in history.",
        "Never forget to commit a removal.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can add files, change them, and now remove them. One more file skill left: renaming without losing history.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Renaming Files (git mv)",
      text: "Renaming a file with Git keeps its history attached, so you never lose track of what it was.",
    },
  ],
};
