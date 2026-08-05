import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 12 · git log
 *
 * git log reads your history like a story, newest first. Introduces the
 * timeline visualization, the full log, the --oneline shortcut, and the
 * HEAD -> branch marker.
 */
export const lesson12: ContentLesson = {
  id: "git-log",
  slug: "git-log",
  title: "git log",
  description:
    "Every snapshot you've ever saved, in order. Meet git log — the command that reads your project's autobiography.",
  meta: {
    module: "git-basics",
    order: 7,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "log", "history"],
    summary: [
      "git log lists snapshots, newest first.",
      "git log --oneline is the one-line version.",
      "HEAD -> main marks where you are.",
      "Hashes are the ID cards you point at.",
    ],
    whyItMatters:
      "History is where all Git's power lives. git log is how you read it — and soon, how you jump around in it.",
    motivation:
      "You can read history now. Next up: git diff — the magnifying glass that shows exactly what changed between snapshots.",
  },
  learningGoals: [
    "Read git log output",
    "Use git log --oneline",
    "Spot the HEAD marker in history",
  ],
  xpReward: 45,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll be able to open your project's history and read it like a book — quickly, and without confusion.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You've made a few snapshots. How do you look back at them? With git log — the command that reads your project's diary, newest entry first.",
    },

    // ---------------------------------------------------------------
    // 1 · See the timeline.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-timeline",
      level: 2,
      text: "Your history, as a timeline",
    },
    {
      type: "paragraph",
      id: "timeline-question",
      text: "Here's a small project's life. Each dot is one commit — click them to inspect.",
    },
    {
      type: "gitGraph",
      id: "visual-log",
      title: "A project's diary",
      width: 320,
      height: 112,
      commits: [
        {
          id: "c1",
          x: 30,
          y: 24,
          lane: 0,
          message: "Add landing page",
          branch: "main",
          timestamp: "day 1",
          filesChanged: ["index.html"],
        },
        {
          id: "c2",
          x: 96,
          y: 24,
          lane: 0,
          message: "Add user login",
          branch: "main",
          timestamp: "day 2",
          filesChanged: ["login.js", "index.html"],
        },
        {
          id: "c3",
          x: 162,
          y: 24,
          lane: 0,
          message: "Fix search crash",
          branch: "main",
          timestamp: "day 3",
          filesChanged: ["search.js"],
          accent: true,
        },
      ],
      lines: [
        {
          id: "timeline",
          points: [
            { x: 30, y: 24 },
            { x: 96, y: 24 },
            { x: 162, y: 24 },
          ],
        },
      ],
    },
    {
      type: "callout",
      id: "timeline-connect",
      tone: "info",
      title: "Newest on top",
      text: "Git always shows the newest commit first. Your most recent work — the HEAD commit — is the first thing you see.",
    },

    // ---------------------------------------------------------------
    // 2 · The commands.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-commands",
      level: 2,
      text: "git log and git log --oneline",
    },
    {
      type: "paragraph",
      id: "commands-question",
      text: "The full log is thorough; --oneline is what everyone actually types. Watch both.",
    },
    {
      type: "terminalSteps",
      id: "terminal-log",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "index.html": "<h1>hi</h1>\n",
          "login.js": "// login\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add index.html",
          output: "index.html is now staged and ready for its snapshot.",
          outputKind: "success",
        },
        {
          command: 'git commit -m "Add landing page"',
          output: "[main (root-commit) 9c2d1a7] Add landing page\n 1 file changed",
          outputKind: "success",
        },
        {
          command: "git add login.js",
          output: "login.js is now staged and ready for its snapshot.",
          outputKind: "success",
        },
        {
          command: 'git commit -m "Add user login"',
          output: "[main 5b8e20c] Add user login\n 1 file changed",
          outputKind: "success",
        },
        {
          command: "git log --oneline",
          output: "5b8e20c (HEAD -> main) Add user login\n9c2d1a7 Add landing page",
          outputKind: "output",
          note: "One line per snapshot, newest first. HEAD -> main marks where you are.",
        },
      ],
    },
    {
      type: "callout",
      id: "commands-connect",
      tone: "success",
      title: "Reading the one-liner",
      text: "git log --oneline gives each snapshot one line: its short hash, then its message. The \"(HEAD -> main)\" badge means this is your current position. Two lines of history, and you instantly know the whole story.",
    },

    // ---------------------------------------------------------------
    // 3 · Common mistake.
    // ---------------------------------------------------------------
    {
      type: "warning",
      id: "mistake",
      title: "\"git log doesn't show my file?\"",
      text: "git log shows commits, not files. It's the diary, not the contents. To see what changed inside a commit, you'll use git diff and git show — up next.",
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
        "git log --oneline shows you five commits, newest first. In your own words, what does the top line's \"HEAD -> main\" badge mean?",
      hint: "Remember the red dot on a map — where are you standing right now?",
      exampleAnswer:
        "The top line is the newest snapshot, and the badge means my current position is on the main branch at this exact commit. It's Git saying 'you are here'.",
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
        id: "quiz-git-log",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "What does git log show?",
            options: [
              "Your snapshots, newest first",
              "Your passwords",
              "Only deleted files",
              "The weather",
            ],
            correctIndex: 0,
            explanation: "git log lists your commits in reverse order — newest at the top.",
          },
          {
            id: "q2",
            prompt: "What's the point of git log --oneline?",
            options: [
              "One compact line per snapshot",
              "It deletes history",
              "It opens an editor",
              "It's a joke",
            ],
            correctIndex: 0,
            explanation: "It's the fast, human-friendly way to skim your history.",
          },
          {
            id: "q3",
            prompt: "The \"HEAD -> main\" badge means…",
            options: [
              "I'm at this commit on main right now",
              "The computer is stuck",
              "I need to push",
              "There's a bug",
            ],
            correctIndex: 0,
            explanation: "It marks your current position in history.",
          },
          {
            id: "q4",
            prompt: "Which snapshot does git log show first?",
            options: ["The newest", "The oldest", "The largest", "A random one"],
            correctIndex: 0,
            explanation: "Git shows history newest first, so you see where you are immediately.",
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
        "git log lists your snapshots, newest first.",
        "git log --oneline = one compact line per commit.",
        "The hash is a snapshot's ID card.",
        "HEAD -> branch marks your current spot.",
        "Read history like a diary — and soon, navigate it.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can read history. Now the magnifying glass: git diff, which shows the exact before-and-after of any change.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git diff",
      text: "See precisely which lines changed — green for added, red for removed.",
    },
  ],
};
