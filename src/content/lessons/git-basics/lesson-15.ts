import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 15 · .gitignore
 *
 * The "do not look at these" list. A hidden file named .gitignore tells Git
 * which files to never track  -  secrets, build junk, cache. Uses the directory
 * tree (ignored styling), an editor block, and a live terminal.
 */
export const lesson15: ContentLesson = {
  id: "gitignore",
  slug: "gitignore",
  title: ".gitignore",
  description:
    "Some files should never be saved: secrets, junk, build files. Meet .gitignore, Git's 'do not look at these' list.",
  meta: {
    module: "core-commands",
    order: 10,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics", "gitignore"],
    summary: [
      ".gitignore is a list of files Git must never track.",
      "Great for secrets, caches, and build junk.",
      "Patterns like *.log and node_modules/ work.",
      "Tracked files aren't ignored just by adding them.",
    ],
    whyItMatters:
      "A clean history starts here. .gitignore is how professionals keep secrets out and repos tidy, and it's the last piece of the Git Basics foundation.",
    motivation:
      "Git Basics complete! You know the whole core flow now. Next stop: history, where you'll learn to read and travel through every snapshot you've ever saved.",
  },
  learningGoals: [
    "Explain what .gitignore is for",
    "Write simple ignore patterns",
    "Know what never belongs in a repository",
  ],
  xpReward: 55,
    playground: {
      "seed": {
        "files": {
          "README.md": "Hello\n",
          "secret.env": "password=1234\n"
        },
        "pwd": "~/project",
        "initialized": true
      },
      "objectives": [
        {
          "id": "create-ignore",
          "label": "Create a .gitignore file",
          "checks": [
            {
              "kind": "fileExists",
              "path": ".gitignore"
            }
          ]
        },
        {
          "id": "ignore-pattern",
          "label": "Ignore .env files",
          "checks": [
            {
              "kind": "fileContent",
              "path": ".gitignore",
              "contains": "*.env"
            }
          ]
        },
        {
          "id": "commit-clean",
          "label": "Commit the ignore list without the secret",
          "checks": [
            {
              "kind": "commitTouchesFile",
              "path": ".gitignore"
            },
            {
              "kind": "commitDoesNotTouchFile",
              "path": "secret.env"
            }
          ]
        }
      ],
      "hints": [
        "Create a .gitignore file; echo works, or use the file editor.",
        "One line is enough: *.env matches every .env file.",
        "Run git status and watch Git stop noticing secret.env.",
        "Stage and commit; the secret never makes it into history."
      ],
      "solution": [
        "echo \"*.env\" > .gitignore",
        "git status",
        "git add .",
        "git commit -m \"Add .gitignore\""
      ],
      "suggestions": [
        "cat .gitignore",
        "echo \"*.env\" > .gitignore",
        "git status",
        "git add ."
      ],
      "visualizer": {
        "highlight": "working-tree",
        "banner": "Tell Git what to ignore"
      },
      "shell": {
        "primaryCommand": "cat .gitignore",
        "placeholder": "cat .gitignore",
        "quickActions": [
          "cat .gitignore",
          "git status",
          "touch .gitignore"
        ],
        "welcomeText": "Tell Git what to ignore.",
        "helperText": ".gitignore lists files Git must never track. Secret files, build junk, logs; they stay out of history."
      }
    },

  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll be able to tell Git exactly what to ignore, and you'll understand why every professional project has one of these files.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Some files are private, some are junk, some rebuild themselves automatically. They have one thing in common: they should never be saved to history.",
    },
    {
      type: "callout",
      id: "gitignore-story",
      tone: "info",
      title: "The messy desk",
      text: "Imagine your desk has candy wrappers and secret notes on it. A tidy person (Git) would normally pick up everything, but you give them a list: \"never touch these\". That list is .gitignore. The wrappers stay, the secrets stay, and history stays clean.",
    },

    // ---------------------------------------------------------------
    // 1 · See ignored files.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-see",
      level: 2,
      text: "Spot the ignored",
    },
    {
      type: "paragraph",
      id: "see-question",
      text: "In this project, a few files are dimmed. Those are the ignored ones. Git will never track them, no matter what.",
    },
    {
      type: "directoryTree",
      id: "directory-ignore",
      base: "~/project/",
      title: "Which files does Git ignore?",
      nodes: [
        {
          name: "project",
          type: "directory",
          children: [
            { name: "src", type: "directory", children: [{ name: "app.js", type: "file", tracked: true }] },
            { name: "README.md", type: "file", tracked: true },
            { name: ".gitignore", type: "file", tracked: true, highlight: true, note: "the ignore list" },
            { name: "secret.env", type: "file", ignored: true, note: "ignored: it holds a password" },
            { name: "node_modules", type: "directory", ignored: true, note: "ignored: it rebuilds itself" },
            { name: "debug.log", type: "file", ignored: true, note: "ignored: junk" },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      id: "see-explain",
      text: "secret.env, node_modules and debug.log are all dimmed. Git won't watch them. README.md and app.js are normal. The .gitignore file itself is tracked, because it's an important part of your project.",
    },

    // ---------------------------------------------------------------
    // 2 · Write the list.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-write",
      level: 2,
      text: "Write the list",
    },
    {
      type: "paragraph",
      id: "write-question",
      text: "Here's a real .gitignore. Every line is one thing to ignore. Read it, then edit it in Interactive mode.",
    },
    {
      type: "editor",
      id: "editor-gitignore",
      language: "text",
      filename: ".gitignore",
      code: "# secrets\n*.env\n\n# junk that rebuilds itself\nnode_modules/\n*.log",
    },
    {
      type: "callout",
      id: "write-connect",
      tone: "success",
      title: "Patterns, not just names",
      text: "*.env ignores every file ending in .env. node_modules/ ignores the whole folder. *.log ignores every log file. Patterns let one line cover a thousand files.",
    },

    // ---------------------------------------------------------------
    // 3 · Make it work in the terminal.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-live",
      level: 2,
      text: "Watch it work",
    },
    {
      type: "paragraph",
      id: "live-question",
      text: "Create a .gitignore, drop a secret file, and watch Git stop noticing it. (In a real repo, secrets should still never be committed. .gitignore is the first line of defense.)",
    },
    {
      type: "terminalSteps",
      id: "terminal-gitignore",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "Hello\n",
          "secret.env": "password=1234\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: 'echo "*.env" > .gitignore',
          output: "wrote .gitignore",
          outputKind: "success",
          note: "One line: ignore anything ending in .env.",
        },
        {
          command: "git status",
          output: 'On branch main\n\nNo commits yet\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\t.gitignore\n\tREADME.md',
          outputKind: "muted",
          note: "Notice: secret.env is NOT listed. Git can't see it anymore.",
        },
        {
          command: "git add .",
          output: "2 files are now staged and ready for their snapshot.",
          outputKind: "success",
        },
        {
          command: 'git commit -m "Add .gitignore"',
          output: "[main (root-commit) 5d016ac] Add .gitignore\n 2 files changed",
          outputKind: "success",
          note: "The secret never made it into history. Exactly what we wanted.",
        },
      ],
    },
    {
      type: "warning",
      id: "live-warning",
      title: "Ignore first, commit later",
      text: ".gitignore only protects files that were never tracked. If you already committed a secret, adding it to .gitignore won't remove it from history. It's still in past snapshots. Rule: set up .gitignore early, before your first commit.",
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
        "Write .gitignore lines to ignore .log files and a cache folder.",
      hint: "One pattern ends in *.log. The other is a folder name with a slash.",
      exampleAnswer:
        "I'd write:\n*.log\ncache/\n\nThe first ignores every log file; the second ignores the whole cache folder. Git will never track either.",
    },

    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    // 6 · Takeaways.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-takeaways",
      level: 2,
      text: "What to remember",
    },
    {
      type: "tip",
      id: "tip-gitignore",
      title: "Quick tip",
      text: "Set up .gitignore BEFORE your first commit. A secret committed once stays in history forever.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        ".gitignore tells Git which files to never track.",
        "Great for secrets, caches, and build junk.",
        "Patterns: *.log, node_modules/, cache/.",
        "Set it up BEFORE your first commit.",
        "Committed secrets stay in history. Ignore early.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Git Basics is complete. You know the entire core flow. Now Git shows its real magic: the ability to work on many things at once without them ever fighting.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Commit History",
      text: "The History module unlocks next. Learn to read your whole timeline with git log, understand HEAD, and travel through your snapshots.",
    },
  ],
};
