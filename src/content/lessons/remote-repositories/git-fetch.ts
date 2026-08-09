import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · git fetch
 *
 * Fetch checks what's new on the remote and reports it, but never changes
 * your own work. It's a safe way to look before you leap.
 */
export const lessonGitFetch: ContentLesson = {
  id: "git-fetch",
  slug: "git-fetch",
  title: "git fetch",
  description:
    "git fetch checks what's new on the remote without touching your own work. Look before you leap.",
  meta: {
    module: "remote-repositories",
    order: 4,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["remote", "fetch"],
    summary: [
      "git fetch checks the remote and reports what's new.",
      "Fetch never changes your own work.",
      "It's a safe way to check what's new.",
      "Use git pull to actually bring changes in.",
    ],
    whyItMatters:
      "Before merging or pulling, it's smart to see what's coming. Fetch lets you peek at the remote's new work without risking anything.",
    motivation:
      "You can peek at the remote now. Next, you'll bring those changes into your branch with git pull.",
  },
  learningGoals: [
    "Fetch new commits with git fetch",
    "Know fetch never changes your work",
    "Compare what's new before pulling",
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
      'echo "<h1>updated home</h1>" > index.html',
      "git add .",
      'git commit -m "Teammate updates homepage"',
    ],
    objectives: [
      {
        id: "fetch-safe",
        label: "Check the remote safely with git fetch",
        checks: [{ kind: "reflogHas", text: "fetch:" }],
      },
      {
        id: "untouched",
        label: "Confirm your work is untouched",
        checks: [
          { kind: "reflogHas", text: "fetch:" },
          { kind: "workingTreeClean" },
          { kind: "fileContent", path: "index.html", contains: "<h1>hi" },
        ],
      },
    ],
    hints: [
      "Run git fetch to see what's new on the remote.",
      "Notice your files didn't change. Fetch only looks.",
      "Run git status to confirm everything is clean and safe.",
    ],
    solution: ["git fetch", "git status"],
    suggestions: ["git fetch", "git status"],
    visualizer: { highlight: "head", banner: "git fetch looks at the remote without touching your work" },
    shell: {
      primaryCommand: "git fetch",
      placeholder: "git fetch",
      quickActions: ["git fetch", "git status"],
      welcomeText: "Check what's new on the remote.",
      helperText: "A teammate pushed new work. Fetch it and see that your files stay untouched.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll check what's new on the remote, safely, without touching a single one of your own changes.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Your teammate just pushed new work. You want to know what's coming before you merge it in. Is there a way to look first?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Peeking at the mailbox",
      text: "Fetch is like peeking at your mailbox to see if a letter arrived. Looking doesn't change anything in your house. You read what's there, then decide what to do. That's fetch.",
    },

    // ---------------------------------------------------------------
    // 1 · What fetch does.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-what",
      level: 2,
      text: "What fetch does",
    },
    {
      type: "paragraph",
      id: "what-question",
      text: "Fetch talks to the remote, checks for any new commits, and tells you what it found. Your own files stay exactly as they were.",
    },
    {
      type: "callout",
      id: "what-connect",
      tone: "success",
      title: "Look, don't touch",
      text: "The safest command in Git. Fetch only reads. It never merges, never changes your files, never moves your work. You can fetch as often as you like.",
    },
    {
      type: "callout",
      id: "what-note",
      tone: "tip",
      title: "Fetch in Panda",
      text: "In Panda, fetch checks the remote and reports what's new, but it does not create a visible origin/main reference. In real Git, fetch also updates remote-tracking branches. Panda uses a simpler model: fetch reports, pull brings the work in.",
    },

    // ---------------------------------------------------------------
    // 2 · Fetch in action.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-run",
      level: 2,
      text: "Run the fetch",
    },
    {
      type: "paragraph",
      id: "run-question",
      text: "Your teammate pushed new work. Fetch it and see what Git reports.",
    },
    {
      type: "terminalSteps",
      id: "terminal-fetch",
      title: "panda-shell",
      prompt: "$",
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
          files: {
            "README.md": "My project\n",
            "index.html": "<h1>hi</h1>\n",
          },
        },
      },
      setup: ["git init", "git add .", 'git commit -m "Start"'],
      remoteSetup: [
        "git init",
        "git add .",
        'git commit -m "Start"',
        'echo "<h1>updated home</h1>" > index.html',
        "git add .",
        'git commit -m "Teammate updates homepage"',
      ],
      steps: [
        {
          command: "git fetch",
          output: "Remote has 1 new commit (1153b62).\nYour work is untouched. Run git pull to bring them in.",
          outputKind: "success",
          note: "Git found new work on the remote but left your files alone.",
        },
        {
          command: "git status",
          output: "On branch main\n\nnothing to commit, working tree clean",
          outputKind: "muted",
          note: "Your branch is exactly as it was. Fetch changed nothing.",
        },
      ],
    },
    {
      type: "callout",
      id: "run-connect",
      tone: "success",
      title: "The key sentence",
      text: "\"Your work is untouched.\" That's the whole point of fetch. You saw what's new, and nothing on your side moved.",
    },

    // ---------------------------------------------------------------
    // 3 · Fetch vs pull.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-vs",
      level: 2,
      text: "Fetch vs pull",
    },
    {
      type: "paragraph",
      id: "vs-question",
      text: "If fetch only looks, how do you actually get the new work? That's pull, which you'll meet next.",
    },
    {
      type: "callout",
      id: "vs-connect",
      tone: "tip",
      title: "Two steps, or one",
      text: "Fetch is the safe look. Pull brings the work in. You can fetch and pull separately, or just pull and let Git do both at once.",
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
      title: "Fetching and thinking you're up to date",
      text: "Fetch reports the news but doesn't merge it. Your local branch stays behind until you pull. If you only fetch, teammates' work won't appear in your files yet.",
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
        "You fetched and Git said the remote has new work. But your files didn't change. Why?",
      hint: "What does fetch do, and what does it not do?",
      exampleAnswer:
        "Because fetch only looks and reports. It doesn't merge. My files stay as they are until I run git pull to actually bring the new work in.",
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
      id: "tip-fetch",
      title: "Quick tip",
      text: "Run git fetch before a big merge. Seeing what's coming makes surprises rare and merges calm.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "git fetch checks the remote and reports what's new.",
        "Fetch never changes your own work.",
        "It's a safe way to check what's new.",
        "Your files stay untouched after fetch.",
        "Use git pull to actually bring work in.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can look at the remote safely now. Next, you'll bring those changes in with git pull.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git pull",
      text: "Learn how fetch and merge work together to update your branch.",
    },
  ],
};
