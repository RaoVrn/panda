import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 1 · What is Git?
 *
 * The golden template. Every section follows the same rhythm:
 *   1. Ask a simple question.
 *   2. Tell a real-life story.
 *   3. Show an animation.
 *   4. Let the learner interact.
 *   5. Explain what just happened.
 *   6. Connect it to Git.
 * Written for someone who has never coded and has never heard of Git.
 */
export const lesson01: ContentLesson = {
  id: "what-is-git",
  slug: "what-is-git",
  title: "What is Git?",
  description:
    "Imagine a time machine for your homework. That's what Git is, and it's the quiet superpower behind nearly every app you love.",
  meta: {
    module: "introduction",
    order: 1,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics"],
    summary: [
      "Git remembers your work.",
      "Git stores snapshots.",
      "Git works offline.",
      "Git is not GitHub.",
    ],
    whyItMatters:
      "Before you ever write code, this one idea changes everything: you can never truly lose your work. Every developer on Earth leans on it every single day.",
    motivation:
      "Understanding the idea was the hardest part. The rest of the course is downhill from here. See you in the next lesson!",
  },
  learningGoals: [
    "Explain what Git is using the time-machine idea",
    "Recognize that a commit is a saved snapshot",
    "Know where Git keeps its history",
    "Tell the difference between Git and GitHub",
  ],
  xpReward: 50,
  blocks: [
    // ---------------------------------------------------------------
    // Opening: a question, a story, no definitions.
    // ---------------------------------------------------------------
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you won’t just know what Git is. You’ll feel why it exists, because you’ll have almost needed it yourself.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Have you ever spent a long time on something like a drawing, a story, or a project, and then lost it all in one second?",
    },
    {
      type: "callout",
      id: "open-story",
      tone: "info",
      title: "The drawing you never finished",
      text: "Imagine three hours. You’ve drawn every tree, shaded every sky. Right before you finish, your hand slips, and you hit delete. It’s all gone. That sinking feeling is the only feeling you need to remember today.",
    },
    {
      type: "paragraph",
      id: "open-time-machine",
      text: "Now imagine the same moment, but this time you own a time machine. One click, and the drawing comes back, exactly as it was. Every single version you ever made. That is what Git does for your work.",
    },

    // ---------------------------------------------------------------
    // 1 · Save game storyboard.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-savegame",
      level: 2,
      text: "You already know this trick",
    },
    {
      type: "paragraph",
      id: "savegame-question",
      text: "If you’ve ever played a video game, you’ve already used a time machine. Remember this scene?",
    },
    {
      type: "storyboard",
      id: "savegame-board",
      title: "A night of gaming",
      nodes: [
        { id: "b1", text: "You reach the boss. It looks tough.", icon: "game" },
        { id: "b2", text: "Smart move. You save your game first.", icon: "save" },
        { id: "b3", text: "The fight begins!", icon: "sword" },
        { id: "b4", text: "You lose. It hurts a little.", icon: "skull" },
        { id: "b5", text: "You load your save point.", icon: "load" },
        { id: "b6", text: "You're back before the boss, and this time you win.", icon: "happy" },
      ],
    },
    {
      type: "callout",
      id: "savegame-connect",
      tone: "success",
      title: "Git works exactly like this",
      text: "A save point never protects you from the fight. It just means you can always try again. Git is that save point for your work. Lose something? Load an older version and keep going.",
    },

    // ---------------------------------------------------------------
    // 2 · School assignment: short story, then connect.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-assignment",
      level: 2,
      text: "Your homework, saved",
    },
    {
      type: "paragraph",
      id: "assignment-question",
      text: "Now think of your biggest school assignment. It takes days. Would you rather lose everything on the last night, or be able to jump back to any earlier draft?",
    },
    {
      type: "paragraph",
      id: "assignment-story",
      text: "Every developer faces this exact worry, except their “homework” is hundreds of files. Git is the answer they chose. Each time they save, Git keeps a full copy, and you can rewind to any of them, forever.",
    },

    // ---------------------------------------------------------------
    // 3 · Watch history grow: the snapshot timeline.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-timeline",
      level: 2,
      text: "Watch history grow",
    },
    {
      type: "paragraph",
      id: "timeline-question",
      text: "A project starts as one empty folder. What does it look like as it grows? Watch closely. Each dot below is one saved moment.",
    },
    {
      type: "gitGraph",
      id: "visual-snapshots",
      title: "A project’s life, in saves",
      width: 320,
      height: 70,
      commits: [
        {
          id: "c1",
          x: 30,
          y: 24,
          lane: 0,
          message: "Project created",
          branch: "main",
          timestamp: "day 1",
          filesChanged: ["index.html", "style.css"],
        },
        {
          id: "c2",
          x: 96,
          y: 24,
          lane: 0,
          message: "Another edit: added a note",
          branch: "main",
          timestamp: "day 3",
          filesChanged: ["README.md"],
        },
        {
          id: "c3",
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
      id: "timeline-explain",
      text: "Notice how the dots only go forward. In Read mode you watched them appear; in Interactive mode click any dot to see its message, files, and time. That list of dots is your history, and you can land on any one of them.",
    },
    {
      type: "callout",
      id: "timeline-connect",
      tone: "info",
      title: "That’s a snapshot",
      text: "Each dot is called a snapshot. It's a full picture of the project at that moment. Make a mess later? Land on an older dot, and the mess is gone. Nothing is ever truly lost.",
    },

    // ---------------------------------------------------------------
    // 4 · The folder: where Git keeps its memory.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-folder",
      level: 2,
      text: "Where Git hides its memory",
    },
    {
      type: "paragraph",
      id: "folder-question",
      text: "A project is just a folder on your computer. So where does Git store all those snapshots? Watch the folder build itself.",
    },
    {
      type: "directoryTree",
      id: "directory-project",
      base: "~/project/",
      title: "A project folder, building itself",
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
      id: "folder-explain",
      text: "The `.git` folder is where Git keeps its memory. Every snapshot you save is filed away in `objects`. You never need to open it, because Git takes care of it. Your files stay clean and untouched on top.",
    },

    // ---------------------------------------------------------------
    // 5 · The editor: make a change, save a snapshot.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-editor",
      level: 2,
      text: "Make one tiny change",
    },
    {
      type: "paragraph",
      id: "editor-question",
      text: "Here’s a real file: a note called README. Right now it says “Hello Panda”. What happens when you change it?",
    },
    {
      type: "editor",
      id: "editor-live",
      language: "markdown",
      filename: "README.md",
      code: "Hello Panda",
    },
    {
      type: "paragraph",
      id: "editor-interact",
      text: "In Interactive mode, add an exclamation mark at the end so it reads `Hello Panda!`. Then press “Save snapshot”. Watch the green highlight and the before/after compare.",
    },
    {
      type: "callout",
      id: "editor-connect",
      tone: "info",
      title: "Git noticed this change",
      text: "A single “!”. And Git saw it. When you saved the snapshot, Git stored the file exactly as it looked after your edit. Now before and after exist side by side, forever.",
    },

    // ---------------------------------------------------------------
    // 6 · The terminal: turning Git on.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-terminal",
      level: 2,
      text: "Turning Git on",
    },
    {
      type: "paragraph",
      id: "terminal-question",
      text: "Developers talk to their computer in a box called a terminal. Want to see the first thing they type to start protecting a project?",
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
          note: "This creates the hidden .git folder you just met.",
        },
        {
          command: "git status",
          output: "On branch main\n\nNo commits yet\n\nUntracked files:\n  README.md",
          outputKind: "muted",
          note: "Git sees README.md but isn’t watching it yet.",
        },
        {
          command: "git add README.md",
          output: "README.md is now staged and ready for its first snapshot.",
          outputKind: "success",
        },
        {
          command: "git commit -m \"hello world\"",
          output: "[main (root-commit) a1b2c3d] hello world\n 1 file changed, 1 insertion(+)",
          outputKind: "success",
          note: "That’s the snapshot. Saved.",
        },
      ],
    },
    {
      type: "paragraph",
      id: "terminal-explain",
      text: "Four short words: `init` wakes Git up, `status` asks what it sees, `add` points at a file, and `commit` takes the snapshot. We’ll unpack each one soon. For now, just feel the rhythm.",
    },

    // ---------------------------------------------------------------
    // 7 · Git vs GitHub: one picture.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-github",
      level: 2,
      text: "Git vs GitHub",
    },
    {
      type: "paragraph",
      id: "github-question",
      text: "Two names, one letter apart. Are they the same? Watch how they fit together.",
    },
    {
      type: "gitVsGithub",
      id: "github-board",
      title: "Two homes for your work",
    },
    {
      type: "callout",
      id: "github-connect",
      tone: "warning",
      title: "Easy to mix up, so don’t",
      text: "Git is the engine inside your computer. GitHub is the website in the cloud where people share projects. Together they’re a team; alone they’re just different tools.",
    },

    // ---------------------------------------------------------------
    // 8 · Mini challenge.
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
        "Your homework is almost finished. You reach to delete one bad paragraph and accidentally delete everything. How would Git help you survive this? Answer in your own words.",
      hint: "Remember the save point. Git kept a snapshot of your work a little while ago. What can you do with it?",
      exampleAnswer:
        "I wouldn’t panic, because Git saved snapshots as I worked. I’d jump back to the snapshot from a while ago, get my work back, and only lose the last tiny bit, not everything.",
    },

    // ---------------------------------------------------------------
    // 9 · Quick check.
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
        id: "quiz-what-is-git",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "If a friend asked “what is Git?”, the best one-liner is…",
            options: [
              "A time machine for your work",
              "A website for sharing photos",
              "A programming language",
              "A type of computer",
            ],
            correctIndex: 0,
            explanation: "Git remembers your work and lets you go back to any saved moment. That's the whole idea.",
          },
          {
            id: "q2",
            prompt: "What do we call each save Git makes?",
            options: [
              "A snapshot",
              "A download",
              "A text message",
              "A folder icon",
            ],
            correctIndex: 0,
            explanation: "A snapshot is a full picture of the project at that moment, like a game save point.",
          },
          {
            id: "q3",
            prompt: "Where does Git store its memory?",
            options: [
              "In a hidden .git folder",
              "On a cloud you must pay for",
              "In your web browser",
              "Nowhere. It forgets",
            ],
            correctIndex: 0,
            explanation: "The .git folder is Git’s filing cabinet, quietly storing every snapshot.",
          },
          {
            id: "q4",
            prompt: "Do you need the internet to use Git?",
            options: [
              "No. It runs on your computer",
              "Yes, always",
              "Only when you save",
              "Only on weekends",
            ],
            correctIndex: 0,
            explanation: "Git lives entirely on your computer and works offline. GitHub is the part that needs the internet.",
          },
          {
            id: "q5",
            prompt: "Which sentence is TRUE?",
            options: [
              "Git and GitHub are different things",
              "Git and GitHub are the same thing",
              "Git is a website",
              "Git saves your work automatically",
            ],
            correctIndex: 0,
            explanation: "Git is the engine on your computer; GitHub is the website in the cloud. Different jobs, great team.",
          },
        ],
      },
    },

    // ---------------------------------------------------------------
    // 10 · What to remember + gentle close.
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
        "Git is a time machine for your work.",
        "You save moments called snapshots.",
        "Snapshots live in a hidden .git folder.",
        "Git works offline, and GitHub is the online part.",
        "You are in control: Git only saves when you say so.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Ready to see why millions of developers reach for Git every single day and the mess it saved them from?",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Why Git?",
      text: "Next you’ll step back in time to the moment Git was invented, and meet the real-world mess it cleaned up.",
    },
  ],
};