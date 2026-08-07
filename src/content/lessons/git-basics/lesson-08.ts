import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 8 · Staging area
 *
 * The room everyone stumbles on: why does Git need a middle step at all? This
 * lesson makes the "pick your snacks" idea land for real — the staging area is
 * where you build each snapshot file by file, on purpose.
 */
export const lesson08: ContentLesson = {
  id: "staging-area",
  slug: "staging-area",
  title: "Staging Area",
  description:
    "Why doesn't Git just save everything at once? Because you should get to choose. Meet the staging area, the room where you build each snapshot.",
  meta: {
    module: "git-fundamentals",
    order: 7,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics", "staging"],
    summary: [
      "The staging area is a middle room for building a snapshot.",
      "git add puts files in it; git restore --staged takes them out.",
      "It lets you split your work into tidy snapshots.",
      "git commit saves whatever is in the staging area.",
    ],
    whyItMatters:
      "The staging area is Git's most famous 'why two steps?' moment. Get it, and you can make history read like a story instead of a mess.",
    motivation:
      "The staging area just clicked, and once it clicks, it never un-clicks. Next up: reading git status like a pro.",
  },
  learningGoals: [
    "Explain why Git uses a staging area",
    "Stage and unstage files",
    "Split a pile of changes into tidy snapshots",
  ],
  xpReward: 55,
    playground: {
      seed: {"files": {"essay.md": "my essay\n", "picture.png": "draft\n", "notes.txt": "ideas\n"}, "pwd": "~/project", "initialized": true},
      setup: ["git init", "git add essay.md", "git commit -m \"Draft essay\"", "echo \"my essay, now with the fixes\" > essay.md"],
      objectives: [{"id": "stage-essay", "label": "Stage only the essay fix", "checks": [{"kind": "fileStaged", "path": "essay.md"}]}, {"id": "leave-others", "label": "Leave picture.png and notes.txt uncommitted", "persist": false, "checks": [{"kind": "fileNotStaged", "path": "picture.png"}, {"kind": "fileNotStaged", "path": "notes.txt"}]}, {"id": "commit", "label": "Commit \"Add the essay fixes\"", "checks": [{"kind": "anyCommitMessage", "message": "Add the essay fixes"}]}],
      hints: ["Build this snapshot around one idea \u2014 the essay fix, nothing else.", "Stage it: git add essay.md. Watch picture.png and notes.txt stay behind.", "Unstage if you change your mind: git restore --staged essay.md.", "Commit with a message that says exactly what you did."],
      solution: ["git add essay.md", "git commit -m \"Add the essay fixes\""],
      suggestions: ["git add essay.md", "git restore --staged essay.md", "git commit -m"],
      visualizer: {"highlight": "staging", "banner": "Build your snapshot one file at a time"},
      shell: {"primaryCommand": "git add", "placeholder": "git add essay.md", "quickActions": ["git add essay.md", "git add .", "git status"], "welcomeText": "Build your snapshot, file by file.", "helperText": "Stage only the files that belong in this snapshot. git add picks them; git restore --staged puts them back."},
    },

  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll be able to explain why Git has a staging area, and use it to save your work in tidy, thoughtful chunks.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Here's the question that confuses every beginner: why does Git need TWO steps? Why not just hit \"save\" and be done?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "The mixed-up homework",
      text: "Imagine you worked on three things at once: fixed an essay, drew a picture, and jotted notes. If Git saved everything in one snapshot, your history would be one blurry blob: \"did stuff\". The staging area lets you save them as three clean snapshots: \"fixed essay\", \"drew picture\", \"notes\". You choose what goes in each.",
    },

    // ---------------------------------------------------------------
    // 1 · Build a snapshot file by file.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-build",
      level: 2,
      text: "Build it file by file",
    },
    {
      type: "paragraph",
      id: "build-question",
      text: "Here's the whole idea in action. Click files to stage them, click again to unstage, then commit when your snapshot is exactly right.",
    },
    {
      type: "stageArea",
      id: "visual-stage",
      title: "Your snapshot, built to order",
      commitMessage: "Add the essay fixes",
      seed: {
        files: {
          "essay.md": "my essay\n",
          "picture.png": "draft\n",
          "notes.txt": "ideas\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      readFiles: [
        { name: "essay.md", status: "modified" },
        { name: "picture.png", status: "new" },
        { name: "notes.txt", status: "new" },
      ],
    },
    {
      type: "callout",
      id: "build-connect",
      tone: "success",
      title: "That's the superpower",
      text: "You staged only essay.md and left the rest. So your snapshot says exactly one thing: \"Add the essay fixes\". Clean history is built from clean staging decisions, one idea per snapshot.",
    },

    // ---------------------------------------------------------------
    // 2 · The unstage command.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-unstage",
      level: 2,
      text: "Changed your mind? Unstage",
    },
    {
      type: "paragraph",
      id: "unstage-question",
      text: "Stage the wrong file? No problem. Files can walk out of the staging area too. Watch, then try it.",
    },
    {
      type: "terminalSteps",
      id: "terminal-unstage",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "essay.md": "my essay\n",
          "picture.png": "draft\n",
          "notes.txt": "ideas\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add essay.md picture.png",
          output: "2 files are now staged and ready for their snapshot.",
          outputKind: "success",
        },
        {
          command: "git restore --staged picture.png",
          output: "Unstaged 'picture.png'",
          outputKind: "success",
          note: "picture.png steps out of the staging area. essay.md stays. Your choice is always yours.",
        },
        {
          command: 'git commit -m "Add the essay fixes"',
          output: "[main 5f8c21a] Add the essay fixes\n 1 file changed",
          outputKind: "success",
          note: "One clean snapshot. Just the essay, as intended.",
        },
      ],
    },
    {
      type: "tip",
      id: "unstage-tip",
      title: "The command to remember",
      text: "git restore --staged <file> takes a file out of the staging area. It doesn't delete your changes. The file just goes back to the working tree. Nothing lost, ever.",
    },

    // ---------------------------------------------------------------
    // 3 · Why it matters.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-why",
      level: 2,
      text: "Why clean snapshots matter",
    },
    {
      type: "paragraph",
      id: "why-question",
      text: "Weeks later, you'll read your history like a table of contents. \"Fixed the login bug\" means you can jump straight to that moment. \"Did stuff\" tells you nothing. The staging area is how you write history that makes sense.",
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
        "You accidentally staged three files but only want two. What do you do?",
      hint: "There's an --staged command that takes a file back out of the staging area.",
      exampleAnswer:
        "I'd run git restore --staged on the file I don't want in this snapshot. It leaves the staging area and goes back to the working tree, keeping its changes, so I can commit the other two cleanly.",
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
        "The staging area is where you build a snapshot.",
        "git add stages files; git restore --staged unstages.",
        "You choose exactly what goes in each snapshot.",
        "Clean snapshots make history readable.",
        "One idea per commit is the golden habit.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You've got the flow. Now let's master the command you'll type to check your work, reading git status like it's your favorite game's HUD.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git status",
      text: "A guided tour of Git's most important answer to the question: what's happening in my project right now?",
    },
  ],
};
