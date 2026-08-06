import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 5 · Saving snapshots
 *
 * The two commands at the heart of Git: git add (pick what to save) and
 * git commit (take the snapshot). Uses the reusable working-tree → staging →
 * repository visualization so the learner FEELS the flow before they ever type
 * a command.
 */
export const lesson05: ContentLesson = {
  id: "saving-snapshots",
  slug: "saving-snapshots",
  title: "Saving snapshots",
  description:
    "Git never saves on its own. You choose what to save with git add, then press the button with git commit. Watch it happen, then do it yourself.",
  meta: {
    module: "introduction",
    order: 5,
    difficulty: "beginner",
    durationMinutes: 9,
    tags: ["basics", "commit"],
    summary: [
      "Git only saves when you say so.",
      "git add picks which files go into the next snapshot.",
      "git commit takes the snapshot and names it.",
      "Snapshots appear in your history, forever.",
    ],
    whyItMatters:
      "Every Git command for the rest of the course is built on these two. Master add and commit, and Git stops being a mystery and becomes a habit.",
    motivation:
      "That's the whole core of Git right there. Everything else is built on these two commands. Amazing work!",
  },
  learningGoals: [
    "Explain the difference between git add and git commit",
    "Stage files and commit a snapshot",
    "Find the snapshot in your history",
  ],
  xpReward: 55,
    playground: {
      seed: {"files": {"README.md": "My first project\n", "package.json": "{ \"name\": \"panda\" }\n", "src/main.js": "console.log('hi');\n"}, "pwd": "~/project", "initialized": true},
      objectives: [{"id": "stage-readme", "label": "Stage README.md", "checks": [{"kind": "fileStaged", "path": "README.md"}]}, {"id": "stage-main", "label": "Stage src/main.js", "checks": [{"kind": "fileStaged", "path": "src/main.js"}]}, {"id": "leave-out", "label": "Leave package.json out of this snapshot", "persist": false, "checks": [{"kind": "fileNotStaged", "path": "package.json"}]}, {"id": "commit", "label": "Commit \"Start the Panda project\"", "checks": [{"kind": "anyCommitMessage", "message": "Start the Panda project"}]}],
      hints: ["Git never saves by itself \u2014 you pick what goes in with git add.", "Add exactly the two files that belong in this snapshot.", "package.json should stay behind. That's the whole point of the staging area.", "Zip the bag: git commit -m \"Start the Panda project\"."],
      solution: ["git add README.md src/main.js", "git commit -m \"Start the Panda project\"", "git status"],
      suggestions: ["git add README.md", "git add src/main.js", "git commit -m", "git status"],
      visualizer: {"highlight": "staging", "banner": "Pick files, then save a snapshot"},
      shell: {"primaryCommand": "git add", "placeholder": "git add README.md", "quickActions": ["git add README.md", "git commit -m", "git status"], "welcomeText": "Save your first snapshot.", "helperText": "Pick the files you want to save with git add, then commit them with git commit -m."},
    },

  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll have saved a real snapshot — and you'll understand the two-step flow that every Git user on Earth does all day.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Here's a strange but true fact: Git never saves your work by itself. It waits. It watches. And it only takes a picture when you tell it to. Why?",
    },
    {
      type: "callout",
      id: "two-step-story",
      tone: "info",
      title: "Like packing a lunch",
      text: "Imagine getting ready for a picnic. Step one: you decide which snacks go in the bag. Step two: you zip the bag and call it the \"picnic lunch\". Git works the same way. git add chooses the snacks. git commit zips the bag and takes the snapshot.",
    },

    // ---------------------------------------------------------------
    // 1 · The flow, visually.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-flow",
      level: 2,
      text: "Watch the whole flow",
    },
    {
      type: "paragraph",
      id: "flow-question",
      text: "Three files are waiting in your working tree. Click them to move them to the staging area — then press Commit. In Read mode, watch it happen automatically.",
    },
    {
      type: "stageArea",
      id: "visual-add-commit",
      title: "Pick your files, then take the snapshot",
      commitMessage: "Start the Panda project",
      seed: {
        files: {
          "README.md": "My first project\n",
          "package.json": '{ "name": "panda" }\n',
          "src/main.js": "console.log('hi');\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      readFiles: [
        { name: "README.md", status: "new" },
        { name: "src/main.js", status: "new" },
        { name: "style.css", status: "new" },
      ],
    },
    {
      type: "callout",
      id: "flow-connect",
      tone: "success",
      title: "The whole secret of Git",
      text: "Working tree → staging area → repository. Your files start in the working tree, you git add them to the staging area, and git commit moves them into the repository as a permanent snapshot. That's it. That's the flow.",
    },

    // ---------------------------------------------------------------
    // 2 · The commands.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-commands",
      level: 2,
      text: "The two commands",
    },
    {
      type: "paragraph",
      id: "commands-question",
      text: "In a real terminal, the flow looks like this. Notice how each command has a tiny job and Git answers in plain words.",
    },
    {
      type: "terminalSteps",
      id: "terminal-add-commit",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My first project\n",
          "package.json": '{ "name": "panda" }\n',
          "src/main.js": "console.log('hi');\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add README.md src/main.js",
          output: "2 files are now staged and ready for their snapshot.",
          outputKind: "success",
          note: "Only these two go into the next snapshot. style.css stays behind.",
        },
        {
          command: 'git commit -m "Start the Panda project"',
          output: '[main (root-commit) 3f2ab71] Start the Panda project\n 2 files changed',
          outputKind: "success",
          note: "ZIP. A permanent snapshot is born, named with a short message.",
        },
        {
          command: "git status",
          output: "On branch main\nnothing to commit, working tree clean",
          outputKind: "muted",
          note: "\"Working tree clean\" = everything worth saving is saved.",
        },
      ],
    },

    // ---------------------------------------------------------------
    // 3 · The snapshot in history.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-history",
      level: 2,
      text: "The snapshot in your history",
    },
    {
      type: "paragraph",
      id: "history-question",
      text: "Your snapshot didn't vanish — it joined your history. Watch it appear as the first dot on the timeline.",
    },
    {
      type: "gitGraph",
      id: "visual-history",
      title: "Your very first snapshot",
      width: 320,
      height: 70,
      commits: [
        {
          id: "c1",
          x: 30,
          y: 24,
          lane: 0,
          message: "Start the Panda project",
          branch: "main",
          timestamp: "just now",
          filesChanged: ["README.md", "src/main.js"],
          accent: true,
        },
      ],
      lines: [],
    },
    {
      type: "callout",
      id: "history-connect",
      tone: "info",
      title: "It's in the notebook now",
      text: "That dot is real history. Weeks from now, you can jump back to it and this exact moment will reappear. That single dot is why you installed Git.",
    },

    // ---------------------------------------------------------------
    // 4 · Common mistakes.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-mistakes",
      level: 2,
      text: "Three tiny mistakes",
    },
    {
      type: "warning",
      id: "mistake-commit-empty",
      title: "\"nothing to commit\"?",
      text: "It means you forgot git add. The file is changed in your working tree, but it never reached the staging area. Run git add, then commit.",
    },
    {
      type: "warning",
      id: "mistake-message",
      title: "Forgetting the message",
      text: "git commit -m \"hello\" needs that -m and a message in quotes. The message is how you'll recognize this snapshot later — make it say what you did.",
    },
    {
      type: "tip",
      id: "mistake-tip",
      title: "If you can't remember the commands…",
      text: "No one memorizes them overnight. git add → git commit is a rhythm, like the chorus of a song. You'll hum it by the end of the week.",
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
        "You have three files but want only two in the next snapshot. What do you type?",
      hint: "git add only the two you want. The staging area is where you decide.",
      exampleAnswer:
        "I'd type `git add` with the names of the two files I want. The third one stays out because git add only stages the files I tell it to — that's the point of the staging area, it's my filter.",
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
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "Git never saves by itself — you're in charge.",
        "git add picks the files for the next snapshot.",
        "git commit -m \"…\" takes the snapshot.",
        "The flow is always: working tree → staging → repository.",
        "A committed snapshot lives in your history forever.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You just completed the heart of Git. The Introduction is officially over — time to level up into Git Basics and meet every command a developer uses daily.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Repository",
      text: "Time for Git Basics. First up: what's actually inside a repository, and why it's not as mysterious as it sounds.",
    },
  ],
};
