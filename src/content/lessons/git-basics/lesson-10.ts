import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 10 · git add
 *
 * git add is the "pick what to save" command. Covers staging a specific file,
 * several files, or everything at once — and the one mistake that can leak
 * secrets into history.
 */
export const lesson10: ContentLesson = {
  id: "git-add",
  slug: "git-add",
  title: "git add",
  description:
    "The command that says 'save this one'. Learn to stage like a pro — specific files, groups, or everything at once.",
  meta: {
    module: "git-basics",
    order: 5,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "add", "staging"],
    summary: [
      "git add <file> stages one file.",
      "git add file1 file2 stages several at once.",
      "git add . stages everything changed or new.",
      "git add -A is the same as git add . for a repo.",
    ],
    whyItMatters:
      "Staging is how you write clean history. Knowing exactly what you're adding — and never more — is the difference between a tidy timeline and a mess.",
    motivation:
      "Staging's mastered. Now the moment your snapshot becomes permanent history: git commit.",
  },
  learningGoals: [
    "Stage one file, several files, or everything",
    "Choose the right git add for the situation",
    "Explain the danger of staging secrets",
  ],
  xpReward: 45,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll be able to stage exactly what you want — never more, never less — and explain why that's a superpower.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "git add is your way of pointing at files and saying \"you're coming with me\". You can point at one file, a few files, or sweep everything in.",
    },

    // ---------------------------------------------------------------
    // 1 · Three ways to add.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-ways",
      level: 2,
      text: "Three ways to point",
    },
    {
      type: "terminalSteps",
      id: "terminal-add-ways",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "Hello\n",
          "src/main.js": "console.log('hi');\n",
          "src/utils.js": "export const add = 1;\n",
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
          note: "One file. Surgical.",
        },
        {
          command: "git add src/main.js src/utils.js",
          output: "2 files are now staged and ready for their snapshot.",
          outputKind: "success",
          note: "Several files by name. Git accepts a list.",
        },
        {
          command: "git add .",
          output: "1 file is now staged and ready for its snapshot.",
          outputKind: "success",
          note: "The dot means: everything in this folder. notes.txt joins in.",
        },
      ],
    },
    {
      type: "callout",
      id: "ways-connect",
      tone: "info",
      title: "The dot is a shortcut",
      text: "git add . means \"stage everything in the current folder that's changed or new\". It's fast and handy — but it's also a trap, because you sometimes stage things you didn't mean to.",
    },

    // ---------------------------------------------------------------
    // 2 · The secret trap.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-secret",
      level: 2,
      text: "The one mistake to never make",
    },
    {
      type: "paragraph",
      id: "secret-question",
      text: "Imagine your project has a file with a password in it. You run git add . — and suddenly that password is inside your history, forever, even if you delete it later.",
    },
    {
      type: "warning",
      id: "secret-warning",
      title: "Secrets never truly leave Git history",
      text: "A committed secret stays in every past snapshot. The safest rule: never commit passwords, API keys, or private files at all. Later you'll learn .gitignore — a file that tells Git to never even look at them.",
    },
    {
      type: "tip",
      id: "secret-tip",
      title: "Check before you sweep",
      text: "Before git add ., glance at git status. If anything in the list looks private, add files by name instead.",
    },

    // ---------------------------------------------------------------
    // 3 · Watch it happen.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-visual",
      level: 2,
      text: "Watch staging happen",
    },
    {
      type: "stageArea",
      id: "visual-add",
      title: "Pick and stage",
      commitMessage: "Ship the homepage",
      seed: {
        files: {
          "index.html": "<h1>hi</h1>\n",
          "style.css": "body {}\n",
          "secret.env": "password=1234\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      readFiles: [
        { name: "index.html", status: "new" },
        { name: "style.css", status: "new" },
        { name: "secret.env", status: "new" },
      ],
    },
    {
      type: "callout",
      id: "visual-connect",
      tone: "success",
      title: "Your hands, on the wheel",
      text: "Notice what you'd do: stage index.html and style.css — and leave secret.env completely alone. That instinct, repeated every day, is what keeps your history clean and safe.",
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
        "A friend says: \"I just run git add . and never think about it.\" What's one reason that's risky, and what would you tell them?",
      hint: "Think about secrets, or about clean, one-idea snapshots.",
      exampleAnswer:
        "git add . grabs everything, including files you didn't intend — like secrets that would live in history forever. I'd tell them to check git status first and stage by name when anything looks private.",
    },

    // ---------------------------------------------------------------
    // 5 · Quick check.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-quiz",
      level: 2,
      text: "Quick check",
    },
    {
      type: "quiz",
      id: "quiz-1",
      quiz: {
        id: "quiz-git-add",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "What does git add README.md do?",
            options: [
              "Stages one file for the next snapshot",
              "Deletes README.md",
              "Opens README.md",
              "Uploads it",
            ],
            correctIndex: 0,
            explanation: "It moves README.md into the staging area — nothing more.",
          },
          {
            id: "q2",
            prompt: "What does git add . do?",
            options: [
              "Stages everything changed or new in the folder",
              "Stages nothing",
              "Deletes everything",
              "Starts a website",
            ],
            correctIndex: 0,
            explanation: "The dot means 'everything in the current folder'.",
          },
          {
            id: "q3",
            prompt: "Why is committing a secret file dangerous?",
            options: [
              "It stays in Git history forever",
              "Git deletes it",
              "It's just fine",
              "It crashes Git",
            ],
            correctIndex: 0,
            explanation: "Secrets stay in past snapshots even if you delete the file later.",
          },
          {
            id: "q4",
            prompt: "You changed 3 files but want to stage only 2. What do you do?",
            options: [
              "git add with the two names",
              "git add .",
              "git commit everything",
              "Nothing — Git decides",
            ],
            correctIndex: 0,
            explanation: "Stage by name for surgical control. You always choose.",
          },
        ],
      },
    },

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
        "git add <file> stages one file; a list stages many.",
        "git add . stages everything — quick but careless.",
        "Never commit secrets; they live in history forever.",
        "Check git status before sweeping.",
        "You always choose what enters the staging area.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Files are staged. Now the moment of truth: the commit that makes it permanent. Let's get the message right.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git commit",
      text: "The snapshot command, and how to write messages future-you will thank you for.",
    },
  ],
};
