import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 9 · git status
 *
 * A guided tour of Git's most important command. git status is the "what's
 * happening?" question  -  this lesson teaches how to read its three sections
 * like a HUD instead of a wall of text.
 */
export const lesson09: ContentLesson = {
  id: "git-status",
  slug: "git-status",
  title: "git status",
  description:
    "The one command you'll type a hundred times a day. Learn to read git status like a dashboard, not a wall of text.",
  meta: {
    module: "core-commands",
    order: 2,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "status"],
    summary: [
      "git status answers: what's happening in my project?",
      "Three sections: to commit, not staged, untracked.",
      "It never changes anything. It only looks.",
      "A clean status means everything is safely saved.",
    ],
    whyItMatters:
      "Status is how you know where you are. Developers type it constantly because it's the dashboard that tells you what to do next.",
    motivation:
      "You can read Git's dashboard now. Up next: the command that picks what goes into the snapshot. That's git add, done properly.",
  },
  learningGoals: [
    "Run git status and understand every line",
    "Distinguish the three status sections",
    "Recognize the 'clean' state",
  ],
  xpReward: 45,
    playground: {
      "seed": {
        "files": {
          "README.md": "Hello world\n",
          "index.html": "<h1>hi</h1>\n",
          "notes.txt": "draft\n"
        },
        "pwd": "~/project",
        "initialized": true
      },
      "setup": [
        "git init",
        "git add README.md index.html",
        "git commit -m \"Start\"",
        "echo \"Hello world\" > README.md",
        "echo \"<h1>hello</h1>\" > index.html"
      ],
      "objectives": [
        {
          "id": "stage-readme",
          "label": "Stage README.md",
          "checks": [
            {
              "kind": "fileStaged",
              "path": "README.md"
            }
          ]
        },
        {
          "id": "leave-rest",
          "label": "Keep index.html and notes.txt unstaged",
          "persist": false,
          "checks": [
            {
              "kind": "fileNotStaged",
              "path": "index.html"
            },
            {
              "kind": "fileNotStaged",
              "path": "notes.txt"
            }
          ]
        },
        {
          "id": "clean",
          "label": "Commit everything and reach a clean working tree",
          "checks": [
            {
              "kind": "workingTreeClean"
            },
            {
              "kind": "commitCountAtLeast",
              "count": 1
            }
          ]
        }
      ],
      "hints": [
        "git status is Git's dashboard \u2014 run it first and read the three sections.",
        "Stage README.md: git add README.md.",
        "The other files can wait. Notice status separates staged, changed and new.",
        "When you're ready, sweep the rest with git add . and commit."
      ],
      "solution": [
        "git status",
        "git add README.md",
        "git status",
        "git add .",
        "git commit -m \"Finish the homepage\""
      ],
      "suggestions": [
        "git status",
        "git add README.md",
        "git add .",
        "git commit -m"
      ],
      "visualizer": {
        "highlight": "working-tree",
        "banner": "Git's dashboard \u2014 read every section"
      },
      "shell": {
        "primaryCommand": "git status",
        "placeholder": "git status",
        "quickActions": [
          "git status",
          "help"
        ],
        "welcomeText": "Read Git's dashboard.",
        "helperText": "git status reports three rooms: staged changes, unstaged changes, and untracked files. Run it to see where you are."
      }
    },

  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end, running git status will feel like checking your phone. You'll glance at it and instantly know what's going on.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Ever check a game's HUD to see your health and inventory? git status is Git's HUD. It answers one question: what's happening in my project right now?",
    },
    {
      type: "callout",
      id: "status-story",
      tone: "info",
      title: "It only looks, never touches",
      text: "git status is a safe command. It never changes, deletes or saves anything. It just reads the rooms and reports. Type it as often as you like. It can't hurt you.",
    },

    // ---------------------------------------------------------------
    // 1 · The HUD, decoded.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-decode",
      level: 2,
      text: "Decode the HUD",
    },
    {
      type: "paragraph",
      id: "decode-question",
      text: "Here's a real status after some work. Read each section with the captions below.",
    },
    {
      type: "terminalSteps",
      id: "terminal-status",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "Hello world\n",
          "index.html": "<h1>hi</h1>\n",
          "notes.txt": "draft\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add README.md",
          output: "README.md is now staged and ready for its snapshot.",
          outputKind: "success",
        },
        {
          command: "git status",
          output: "On branch main\n\nChanges to be committed:\n  (use \"git restore --staged <file>...\" to unstage)\n\tmodified:   README.md\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n\tmodified:   index.html\n\nUntracked files:\n  (use \"git add <file>...\" to include in what will be committed)\n\tnotes.txt",
          outputKind: "muted",
          note: "Three rooms: staged, changed-but-not-staged, and brand new.",
        },
      ],
    },
    {
      type: "callout",
      id: "decode-sections",
      tone: "success",
      title: "Read it top to bottom",
      text: "\"On branch main\" is where you are. \"Changes to be committed\" are files ready for their snapshot. \"Not staged\" are edited files Git noticed but you haven't picked. \"Untracked files\" are brand new and invisible to history.",
    },

    // ---------------------------------------------------------------
    // 2 · The clean state.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-clean",
      level: 2,
      text: "The clean state",
    },
    {
      type: "paragraph",
      id: "clean-question",
      text: "After you commit everything, status shrinks to the most beautiful phrase in Git.",
    },
    {
      type: "terminalSteps",
      id: "terminal-clean",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "Hello world\n",
          "index.html": "<h1>hi</h1>\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add .",
          output: "2 files are now staged and ready for their snapshot.",
          outputKind: "success",
        },
        {
          command: 'git commit -m "Finish the homepage"',
          output: "[main 7f0bd9e] Finish the homepage\n 2 files changed",
          outputKind: "success",
        },
        {
          command: "git status",
          output: "On branch main\nnothing to commit, working tree clean",
          outputKind: "success",
          note: "\"Working tree clean\" = every change is safely saved. Freedom.",
        },
      ],
    },
    {
      type: "callout",
      id: "clean-connect",
      tone: "success",
      title: "That's the feeling",
      text: "\"Nothing to commit, working tree clean\" is Git's way of saying: everything is safe, nothing is lost, you can go home. It's the calmest sentence in software.",
    },

    // ---------------------------------------------------------------
    // 3 · Common mistakes.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-mistake",
      level: 2,
      text: "Common beginner mistake",
    },
    {
      type: "warning",
      id: "mistake-panic",
      title: "Don't panic at a long status",
      text: "A long status isn't a problem. It's information. Your project isn't broken. Just read the rooms: what's staged, what's changed, what's new. Then decide.",
    },
    {
      type: "tip",
      id: "mistake-habit",
      title: "The pro habit",
      text: "Run git status before you commit and after you commit. It takes two seconds and it's how developers never get lost.",
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
        "git status groups files into three sections. What are they?",
      hint: "Think about which room each file is in: the staging area, the working tree with an old snapshot, or brand new.",
      exampleAnswer:
        "All three are files I've edited or created. The staged one is waiting in the staging area for a commit. The unstaged one has changes Git sees but I haven't picked. The untracked one is brand new with no history yet.",
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
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git status is Git's dashboard.",
        "It only reads. It never changes anything.",
        "Three sections: staged, not staged, untracked.",
        "A clean status means everything is safe.",
        "Check it before and after every commit.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Now the command that fills that staging area. git add, and the trap of git add .",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git add",
      text: "Stage like a pro: specific files vs everything, and when each is the right move.",
    },
  ],
};
