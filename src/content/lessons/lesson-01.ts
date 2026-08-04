import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 1 · What is Git?
 *
 * Authored as a friendly, plain-English first lesson for someone who has never
 * coded and has never heard of Git. Short paragraphs, real-life analogies,
 * questions, and no assumed knowledge.
 */
export const lesson01: ContentLesson = {
  id: "what-is-git",
  slug: "what-is-git",
  title: "What is Git?",
  description:
    "Imagine a time machine for your homework. That’s Git — and it’s the superpower behind nearly every app you love.",
  meta: {
    module: "introduction",
    order: 1,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics"],
    summary: [
      "Git is a time machine that lets you rewind your work.",
      "You save checkpoints called snapshots.",
      "You can return to any saved moment.",
      "Git runs on your computer, no internet needed.",
      "Git and GitHub are two different things.",
    ],
    whyItMatters:
      "Before you write a single line of code, knowing this one idea changes everything: you can never truly lose your work. Every developer on Earth leans on this every single day.",
    motivation:
      "You just understood the most important idea in version control. The rest of the course builds on this — you’re off to a flying start.",
  },
  blocks: [
    // Opening — an invitation, no jargon.
    {
      type: "learningGoal",
      id: "learning-goal",
      text: "By the end of this lesson you’ll know why millions of people call Git a time machine — and why you’ll never want to write without it.",
    },
    {
      type: "paragraph",
      id: "intro-story",
      text: "Let’s start with something you already do. Have you ever been typing a long school assignment, and the power goes out? Or you delete a whole page by accident? That horrible sinking feeling — “it’s all gone” — Git was invented to make sure that never has to happen again.",
    },
    {
      type: "paragraph",
      id: "intro-question",
      text: "What if you could press a button and go back to how your work looked an hour ago? Safe and sound? That tiny fantasy is exactly what Git does. Let’s see how.",
    },

    // Section one — a game you already understand.
    {
      type: "heading",
      id: "section-save-game",
      level: 2,
      text: "You already know how this works",
    },
    {
      type: "callout",
      id: "save-point-game",
      tone: "tip",
      title: "Think of a video game save point",
      text: "Remember saving your game before the final boss? If you lost, you just loaded the save and tried again. Git is the exact same idea — but for your work, and you can make as many saves as you like.",
    },
    {
      type: "paragraph",
      id: "save-point-homework",
      text: "Now picture your school assignment taking days to finish. Would you keep saving it as you go? Of course you would — one careless mistake shouldn’t cost you hours. Developers have that same worry every day, except their “assignment” is often hundreds of files.",
    },

    // Visual — the timeline.
    {
      type: "heading",
      id: "section-timeline",
      level: 2,
      text: "Your project, traveling through time",
    },
    {
      type: "paragraph",
      id: "timeline-intro",
      text: "Each glowing dot below is a full save of a project at one moment in time. In Read mode you’ll watch history grow all on its own. Click any dot to peek at what that save changed.",
    },
    {
      type: "gitGraph",
      id: "visual-snapshots",
      title: "Snapshots of your project — over time",
      width: 320,
      height: 70,
      commits: [
        {
          id: "c1-initial",
          x: 30,
          y: 24,
          lane: 0,
          message: "The very first save",
          branch: "main",
          timestamp: "day 1",
          filesChanged: ["index.html", "style.css"],
          accent: true,
        },
        {
          id: "c2-readme",
          x: 96,
          y: 24,
          lane: 0,
          message: "Added a README note",
          branch: "main",
          timestamp: "day 3",
          filesChanged: ["README.md"],
          accent: true,
        },
        {
          id: "c3-head",
          x: 162,
          y: 24,
          lane: 0,
          message: "You are here",
          branch: "main",
          timestamp: "today",
          filesChanged: ["main.js"],
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
      type: "paragraph",
      id: "timeline-note",
      text: "That’s the whole secret spelled out: Git remembers your project the way your phone remembers photo albums. A save now, a save later, and you can always flip back.",
    },

    // Section two — the folder.
    {
      type: "heading",
      id: "section-folder",
      level: 2,
      text: "It all starts with a folder",
    },
    {
      type: "paragraph",
      id: "folder-intro",
      text: "You already keep things in folders. A folder for photos, one for school, one for music. A programmer’s “project” is just a folder too — with code inside.",
    },
    {
      type: "directoryTree",
      id: "directory-project",
      base: "~/project/",
      title: "A project is just a folder on your computer",
      nodes: [
        {
          name: "project",
          type: "directory",
          children: [
            {
              name: "src",
              type: "directory",
              children: [{ name: "main.js", type: "file", tracked: true }],
            },
            { name: "README.md", type: "file", tracked: true },
            { name: "package.json", type: "file", tracked: true },
            {
              name: ".git",
              type: "directory",
              ignored: true,
              highlight: true,
              note: "hidden folder",
              children: [
                { name: "HEAD", type: "file", note: "points to your current branch" },
                { name: "index", type: "file", note: "the staging area" },
                {
                  name: "objects",
                  type: "directory",
                  note: "your saved snapshots",
                  children: [{ name: "…", type: "file" }],
                },
                {
                  name: "refs",
                  type: "directory",
                  note: "points to branches",
                  children: [{ name: "…", type: "file" }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      id: "folder-note",
      text: "See that little `.git` folder hiding at the bottom? That’s Git’s personal filing cabinet. Every save you make gets stored in there — quietly, out of your way.",
    },
    {
      type: "paragraph",
      id: "folder-question",
      text: "Wondering why it’s hidden? Because you’re not supposed to poke around in it. Git handles it for you, so you can focus on the fun part: making things.",
    },

    // Section three — every tiny change.
    {
      type: "heading",
      id: "section-editor",
      level: 2,
      text: "Git watches every little change",
    },
    {
      type: "paragraph",
      id: "editor-intro",
      text: "Say your project has a note file. Right now it says a friendly hello. Watch:",
    },
    {
      type: "editor",
      id: "editor-before",
      language: "markdown",
      filename: "README.md",
      code: "Hello Panda",
    },
    {
      type: "paragraph",
      id: "editor-arrow",
      text: "Now you make one tiny edit. Just one character.",
    },
    {
      type: "editor",
      id: "editor-after",
      language: "markdown",
      filename: "README.md",
      code: "Hello Panda!",
    },
    {
      type: "callout",
      id: "editor-callout",
      tone: "info",
      title: "Big deal, right?",
      text: "It’s a single “!” — yet Git noticed it. When you press save, Git records the file exactly as it looks now. Now you can compare “before” and “after” forever. One character or a thousand, Git never blinks.",
    },

    // Section four — turning Git on.
    {
      type: "heading",
      id: "section-terminal",
      level: 2,
      text: "Turning Git on",
    },
    {
      type: "paragraph",
      id: "terminal-intro",
      text: "Developers talk to their computer in a plain box called a terminal. To start protecting a project, they run one short command. Here’s what that first session looks like:",
    },
    {
      type: "terminalSteps",
      id: "terminal-init",
      title: "panda-shell",
      prompt: "$",
      steps: [
        {
          command: "git init",
          output: "Initialized an empty Git repository in ~/project/.git/",
          outputKind: "success",
        },
        {
          command: "git status",
          output: "On branch main\n\nNo commits yet\n\nUntracked files:\n  README.md",
          outputKind: "muted",
          note: "Git sees README.md but isn’t watching it yet.",
        },
        {
          command: "git add README.md",
          output: "README.md is now staged — ready for its first save.",
          outputKind: "success",
        },
        {
          command: "git commit -m \"hello world\"",
          output: "[main (root-commit) a1b2c3d] hello world\n 1 file changed, 1 insertion(+)",
          outputKind: "success",
          note: "Git locked in your very first snapshot.",
        },
      ],
    },
    {
      type: "paragraph",
      id: "terminal-note",
      text: "`git init` simply tells Git: “please start keeping an eye on this folder.” Nothing scary, nothing permanent. We’ll unwrap each of those words later — for now, just feel what happened.",
    },

    // Section five — history.
    {
      type: "heading",
      id: "section-history",
      level: 2,
      text: "Every save becomes history",
    },
    {
      type: "gitGraph",
      id: "graph-history",
      title: "Your version history",
      width: 320,
      height: 80,
      commits: [
        {
          id: "c1a1b2c3d",
          x: 30,
          y: 24,
          lane: 0,
          message: "hello world",
          branch: "main",
          timestamp: "2 min ago",
          filesChanged: ["README.md"],
        },
        {
          id: "c2e4f5a6b",
          x: 96,
          y: 36,
          lane: 1,
          message: "dark mode idea",
          branch: "feature",
          timestamp: "1 min ago",
          filesChanged: ["style.css"],
        },
        {
          id: "c3",
          x: 162,
          y: 48,
          lane: 1,
          message: "You are here",
          branch: "feature",
          timestamp: "now",
          filesChanged: ["style.css"],
          accent: true,
        },
      ],
      lines: [
        {
          id: "main",
          points: [
            { x: 30, y: 24 },
            { x: 96, y: 36 },
            { x: 162, y: 48 },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      id: "history-note",
      text: "Every dot is one saved moment. The one wearing the HEAD badge is where you are right now. Mess something up later? Just walk back to an earlier dot and carry on.",
    },

    // Two friendly facts.
    {
      type: "callout",
      id: "fact-offline",
      tone: "success",
      title: "Fun fact #1: no internet needed",
      text: "Git lives entirely on your computer. You could be offline in a cabin in the woods and it works exactly the same. It’s yours.",
    },
    {
      type: "warning",
      id: "fact-github",
      title: "Fun fact #2: Git is NOT GitHub",
      text: "An easy mix-up. Git is the tool that runs on your computer. GitHub is a website where people share their work online. They work together, but they’re not the same thing — like a car (Git) and a parking lot (GitHub).",
    },

    // Three myths, short.
    {
      type: "heading",
      id: "section-myths",
      level: 2,
      text: "Three things beginners mix up",
    },
    {
      type: "callout",
      id: "myth-1",
      tone: "warning",
      title: "“Git saves automatically, right?”",
      text: "Not exactly. Git only saves when you tell it to. You’re the boss — it never saves on its own without your say-so.",
    },
    {
      type: "callout",
      id: "myth-2",
      tone: "warning",
      title: "“Git and GitHub are the same thing?”",
      text: "Nope. Git is the engine on your computer; GitHub is the garage where people park their projects online.",
    },
    {
      type: "callout",
      id: "myth-3",
      tone: "warning",
      title: "“Git backs up my whole computer?”",
      text: "Not quite. Git is a specialist: it tracks versions of a project. For a full computer backup, you’d want something else too.",
    },

    // Recap.
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
        "Git is a time machine for your work.",
        "You save moments called snapshots.",
        "You can always return to a saved moment.",
        "It runs on your computer — no internet needed.",
        "Git and GitHub are different things.",
      ],
    },

    // Quick check.
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
        id: "quiz-what-is-git",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "If you had to explain Git to a friend, what is it?",
            options: [
              "A time machine for your work",
              "A website for pictures",
              "A programming language",
              "A type of computer",
            ],
            correctIndex: 0,
            explanation: "Git remembers your work and lets you go back to earlier versions.",
          },
          {
            id: "q2",
            prompt: "What do we call each save Git makes?",
            options: [
              "A snapshot",
              "A download",
              "A backup of everything",
              "A message to a friend",
            ],
            correctIndex: 0,
            explanation: "Each snapshot is a moment in time you can return to.",
          },
          {
            id: "q3",
            prompt: "Do you need the internet to use Git?",
            options: [
              "No — it runs on your computer",
              "Yes, always",
              "Only when you save",
              "Only on weekends",
            ],
            correctIndex: 0,
            explanation: "Git works fully offline on your own machine.",
          },
          {
            id: "q4",
            prompt: "Which of these is TRUE?",
            options: [
              "Git and GitHub are different things",
              "Git and GitHub are the same thing",
              "Git is a website",
              "Git saves your work automatically",
            ],
            correctIndex: 0,
            explanation: "Git is the tool; GitHub is the website people use to share projects.",
          },
        ],
      },
    },

    // Try it yourself.
    {
      type: "heading",
      id: "section-practice",
      level: 2,
      text: "Try it yourself",
    },
    {
      type: "practice",
      id: "practice-lab",
      description:
        "Imagine writing a school project that keeps growing for days. In your own words: how could a “time machine for your work” stop you from redoing hours of effort?",
      hint: "Think about finishing a long draft, then wanting to undo one small change without losing the rest.",
      exampleAnswer:
        "If I made a mistake or deleted a whole paragraph, I could rewind to the version from a while ago — without throwing away the good parts I wrote after. I’d save checkpoints as I worked, so I could always go back.",
    },

    // Gentle close.
    {
      type: "heading",
      id: "section-close",
      level: 2,
      text: "You did it",
    },
    {
      type: "paragraph",
      id: "close-1",
      text: "Seriously — that first idea is the hardest one, and you’ve got it. Git is a time machine for your work, and now the biggest mental leap is behind you.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Why Git?",
      text: "Next, you’ll discover why Git became the tool that millions of developers reach for every day — and the very real problems it solved along the way.",
    },
  ],
};