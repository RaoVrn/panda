import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 6 · Repository
 *
 * A closer look inside the repository: the .git cabinet, branch labels, the
 * HEAD file, and commit hashes. Demystifies what Git stores so later commands
 * (log, diff, branch) have somewhere to point.
 */
export const lesson06: ContentLesson = {
  id: "repository",
  slug: "repository",
  title: "Repository",
  description:
    "You've made one. Now let's peek inside. A repository is a folder plus a hidden memory, and the parts have names you'll use every day.",
  meta: {
    module: "git-fundamentals",
    order: 5,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics", "repository"],
    summary: [
      "A repository is a folder plus a hidden .git memory.",
      "Objects store your snapshots.",
      "Refs are labels pointing at snapshots.",
      "HEAD is the label that says 'you are here'.",
    ],
    whyItMatters:
      "Every Git command is a small errand inside this cabinet. Learn the rooms, and commands like log, branch and reset stop being random spells.",
    motivation:
      "You now know the inside of a repository better than most beginners. Next: the working tree, the room where you actually live and edit.",
  },
  learningGoals: [
    "Name the main rooms inside .git",
    "Explain what HEAD points to",
    "Recognize a commit hash",
  ],
  xpReward: 45,
    playground: {
      "seed": {
        "files": {
          "README.md": "My project\n",
          "src/main.js": "console.log('hi');\n"
        },
        "pwd": "~/project",
        "initialized": true
      },
      "setup": [
        "git init",
        "git add .",
        "git commit -m \"First snapshot\"",
        "echo \"Now with a subtitle\" >> README.md"
      ],
      "objectives": [
        {
          "id": "log",
          "label": "See the history with git log",
          "checks": [
            {
              "kind": "commitCountAtLeast",
              "count": 1
            },
            {
              "kind": "ranCommand",
              "contains": "git log"
            }
          ]
        },
        {
          "id": "status",
          "label": "Check what Git notices with git status",
          "checks": [
            {
              "kind": "fileNotStaged",
              "path": "README.md"
            },
            {
              "kind": "fileContent",
              "path": "README.md",
              "contains": "subtitle"
            },
            {
              "kind": "ranCommand",
              "contains": "git status"
            }
          ]
        },
        {
          "id": "commit",
          "label": "Save the change with git commit",
          "checks": [
            {
              "kind": "commitCountAtLeast",
              "count": 2
            }
          ]
        }
      ],
      "hints": [
        "This repository already has history. Run git log to read it.",
        "Run git status: Git noticed README.md changed but you haven't saved it yet.",
        "Stage and commit: git add README.md, then git commit -m \"...\"."
      ],
      "solution": [
        "git log",
        "git status",
        "git add README.md",
        "git commit -m \"Add subtitle\""
      ],
      "suggestions": [
        "git log",
        "git status",
        "git add README.md",
        "git commit -m"
      ],
      "visualizer": {
        "highlight": "repository",
        "banner": "A repository is your project's history book"
      },
      "shell": {
        "primaryCommand": "git log",
        "placeholder": "git log",
        "quickActions": [
          "git log",
          "git status",
          "git add ."
        ],
        "welcomeText": "Peek inside a real repository.",
        "helperText": "This repo already has a snapshot. Run git log to read your history, then save the change Git noticed."
      }
    },

  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll be able to open the hood of a Git project and name what you see. No fear, just familiarity.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You've seen the .git folder a couple of times. What actually lives inside it? Think of it as Git's control room.",
    },

    // ---------------------------------------------------------------
    // 1 · The cabinet.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-cabinet",
      level: 2,
      text: "The control room",
    },
    {
      type: "directoryTree",
      id: "directory-internals",
      base: "~/project/",
      title: "Inside a repository",
      nodes: [
        {
          name: ".git",
          type: "directory",
          ignored: true,
          highlight: true,
          note: "Git's control room",
          children: [
            {
              name: "HEAD",
              type: "file",
              note: "a pointer: 'I am on branch main'",
              highlight: true,
            },
            {
              name: "objects",
              type: "directory",
              note: "every snapshot, stored safely",
              children: [{ name: "…", type: "file" }],
            },
            {
              name: "refs",
              type: "directory",
              note: "labels: branch names → snapshot ids",
              children: [
                {
                  name: "heads",
                  type: "directory",
                  children: [{ name: "main", type: "file", note: "points to the newest snapshot" }],
                },
              ],
            },
          ],
        },
        {
          name: "README.md",
          type: "file",
          tracked: true,
          note: "your file, untouched",
        },
      ],
    },
    {
      type: "paragraph",
      id: "cabinet-explain",
      text: "Three things matter. objects is the vault holding every snapshot. refs is a shelf of labels, and each branch name is a label stuck to the latest snapshot. And HEAD is a little note that says which branch you're standing on right now.",
    },

    // ---------------------------------------------------------------
    // 2 · HEAD.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-head",
      level: 2,
      text: "HEAD: you are here",
    },
    {
      type: "paragraph",
      id: "head-question",
      text: "Remember maps that show a red dot labeled \"You are here\"? HEAD is Git's red dot. It points to the branch you're currently working on.",
    },
    {
      type: "callout",
      id: "head-connect",
      tone: "info",
      title: "One little file, huge job",
      text: "Inside .git, HEAD is literally a tiny text file. It usually says something like `ref: refs/heads/main`. That means: \"I am on the branch called main\". Later, when you switch branches, HEAD is the thing that moves.",
    },

    // ---------------------------------------------------------------
    // 3 · Commit hashes.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-hashes",
      level: 2,
      text: "Snapshot ID cards",
    },
    {
      type: "paragraph",
      id: "hash-question",
      text: "Every snapshot gets an ID card with a weird name. That's a commit hash. It's Git's way of giving each snapshot a unique name, so you can point at exactly the right one.",
    },
    {
      type: "code",
      id: "hash-example",
      language: "text",
      filename: "git log",
      code: "commit <commit-hash>\nAuthor: Git Learner <learner@example.com>\nDate:   just now\n\n    Start the Panda project",
    },
    {
      type: "callout",
      id: "hash-connect",
      tone: "success",
      title: "You only need the first 7",
      text: "The full hash is long, so everyone uses just the first 7 characters. When a command says it created a commit, that short ID is this snapshot's name.",
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
      id: "mistake",
      title: "Don't go digging in .git",
      text: "You never need to open these files or edit them. They're Git's private diary. If something looks scary inside, close it. You're not supposed to read it. Git reads it for you.",
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
        "Explain HEAD to a friend without the word \"pointer\".",
      hint: "Remember the red dot on a map that says 'you are here'.",
      exampleAnswer:
        "HEAD is Git's 'you are here' marker. It tells Git which branch I'm working on right now, so new snapshots get added to that branch.",
    },

    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    // 7 · Takeaways.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-takeaways",
      level: 2,
      text: "What to remember",
    },
    {
      type: "tip",
      id: "tip-repository",
      title: "Quick tip",
      text: "You never edit the .git folder yourself. Git reads and writes it for you. Leave it alone.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "A repository = your folder + a hidden .git memory.",
        "objects is the vault of snapshots.",
        "refs are labels (branch names) pointing at snapshots.",
        "HEAD is the 'you are here' note for your current branch.",
        "Commit hashes are snapshots' unique ID cards.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Now that you know where Git keeps its memory, let's look at the room where you do the actual work: the working tree.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Working Tree",
      text: "The working tree is just the folder you see, but Git watches it closely. Let's learn what it's tracking.",
    },
  ],
};
