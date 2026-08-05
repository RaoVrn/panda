import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 7 · Working tree
 *
 * The working tree is the folder you actually see and edit. This lesson builds
 * the tracked vs untracked mental model: Git watches some files, ignores
 * others, and only cares when you tell it to.
 */
export const lesson07: ContentLesson = {
  id: "working-tree",
  slug: "working-tree",
  title: "Working Tree",
  description:
    "The working tree is simply the folder you see and edit. But Git watches it closely — here's what Git notices, and what it politely ignores.",
  meta: {
    module: "git-basics",
    order: 2,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "working-tree"],
    summary: [
      "The working tree is the folder you edit.",
      "Tracked files are ones Git has been told about.",
      "Untracked files are brand new to Git.",
      "Git only snapshots what you stage.",
    ],
    whyItMatters:
      "Half of reading git status is knowing which room Git is talking about. The working tree is that room — and this is where all your work actually happens.",
    motivation:
      "Working tree: understood. Now the middle room — the staging area — which surprises everyone the first time they meet it.",
  },
  learningGoals: [
    "Point to the working tree on your own computer",
    "Explain tracked vs untracked",
    "Predict what Git sees when you add a new file",
  ],
  xpReward: 45,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll see your project folder the way Git sees it — a room full of files, some watched, some brand new.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "When you open your project folder, you see files and folders. That's the working tree. Nothing mysterious — it's just the room where you live and edit.",
    },
    {
      type: "callout",
      id: "working-story",
      tone: "info",
      title: "A restaurant kitchen",
      text: "The working tree is the kitchen counter where the food (your files) sits. Git is the chef who only packs dishes you point at into the picnic bag. The counter itself is just… where things are.",
    },

    // ---------------------------------------------------------------
    // 1 · What Git watches.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-tracking",
      level: 2,
      text: "Tracked and untracked",
    },
    {
      type: "paragraph",
      id: "tracking-question",
      text: "Git has two moods about a file. If it's tracked, Git has saved it in at least one snapshot and keeps an eye on it. If it's untracked, it's brand new — Git sees it but has never been told about it.",
    },
    {
      type: "stageArea",
      id: "visual-tracked",
      title: "The counter, through Git's eyes",
      seed: {
        files: {
          "README.md": "Hello\n",
          "src/main.js": "console.log('hi');\n",
          "notes.txt": "draft\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      readFiles: [
        { name: "README.md", status: "new" },
        { name: "src/main.js", status: "new" },
        { name: "notes.txt", status: "new" },
      ],
    },
    {
      type: "paragraph",
      id: "tracking-explain",
      text: "All three files sit on the counter, but Git hasn't saved any of them yet — so every one is untracked. The moment you stage and commit a file, it becomes tracked, and Git starts noticing every change you make to it.",
    },

    // ---------------------------------------------------------------
    // 2 · Ask Git what it sees.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-status",
      level: 2,
      text: "Ask Git what it sees",
    },
    {
      type: "paragraph",
      id: "status-question",
      text: "Git is happy to tell you what it notices. The command is git status, and it's the one you'll type more than any other.",
    },
    {
      type: "terminalSteps",
      id: "terminal-status",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "Hello\n",
          "src/main.js": "console.log('hi');\n",
          "notes.txt": "draft\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git status",
          output: "On branch main\n\nNo commits yet\n\nUntracked files:\n  README.md\n  src/main.js\n  notes.txt\n\nnothing added to commit but untracked files present",
          outputKind: "muted",
          note: "\"Untracked files\" = Git sees them on the counter but has never snapped them.",
        },
        {
          command: "git add README.md src/main.js",
          output: "2 files are now staged and ready for their snapshot.",
          outputKind: "success",
          note: "notes.txt stays untracked. That's your choice to make.",
        },
      ],
    },
    {
      type: "callout",
      id: "status-connect",
      tone: "success",
      title: "Git never grabs things on its own",
      text: "Notice notes.txt wasn't touched. The working tree can be full of files, and Git will keep ignoring them until you say \"this one too\" with git add. You are always the one who decides.",
    },

    // ---------------------------------------------------------------
    // 3 · Common mistake.
    // ---------------------------------------------------------------
    {
      type: "warning",
      id: "mistake",
      title: "\"Why isn't Git tracking my new file?\"",
      text: "Because you haven't committed it even once. A brand-new file is untracked by default. Add it, commit it, and from that moment it's a tracked citizen.",
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
        "You drop a brand-new file onto your project's counter. Git says it's \"untracked\". In your own words, what does untracked mean, and how does the file become tracked?",
      hint: "Untracked = Git sees it but has no memory of it. What command makes it part of a snapshot?",
      exampleAnswer:
        "Untracked means Git notices the file but has never saved it, so it has no history of it. I'd git add it and commit it once — after that, Git tracks every change to it.",
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
        id: "quiz-working-tree",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "What is the working tree?",
            options: [
              "The folder where you edit your files",
              "Git's hidden memory",
              "A website",
              "The internet",
            ],
            correctIndex: 0,
            explanation: "The working tree is the project folder you actually see and edit — the kitchen counter.",
          },
          {
            id: "q2",
            prompt: "What does 'tracked' mean?",
            options: [
              "Git has saved this file in a snapshot before",
              "Git is following me on social media",
              "The file is very important",
              "The file is locked",
            ],
            correctIndex: 0,
            explanation: "A tracked file is one Git has committed before, so it watches every change to it.",
          },
          {
            id: "q3",
            prompt: "A brand-new file in your project is…",
            options: ["untracked", "tracked", "deleted", "encrypted"],
            correctIndex: 0,
            explanation: "New files are untracked until you add and commit them once.",
          },
          {
            id: "q4",
            prompt: "Does Git snapshot untracked files automatically?",
            options: [
              "No — only files I choose with git add",
              "Yes — every file, always",
              "Only on Mondays",
              "Only if they're small",
            ],
            correctIndex: 0,
            explanation: "Git never grabs files on its own. You pick them with git add.",
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
        "The working tree is the folder you edit.",
        "Tracked = Git has committed it before and watches it.",
        "Untracked = brand new, Git has never saved it.",
        "Git never snaps untracked files on its own.",
        "git status shows you what Git sees on the counter.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Now for the room that surprises everyone on their first day: the staging area. This one takes a second to click — and then it clicks for good.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Staging Area",
      text: "Why does Git need a middle room at all? Because it lets you build each snapshot one file at a time.",
    },
  ],
};
