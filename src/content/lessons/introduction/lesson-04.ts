import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 4 · Creating your first repository
 *
 * The big aha of `git init`: turning a plain folder into a Git project. A
 * blank-notebook story leads into the directory tree (meet the hidden .git
 * folder) and a live terminal where the learner runs git init for real.
 */
export const lesson04: ContentLesson = {
  id: "first-repository",
  slug: "first-repository",
  title: "Creating your first repository",
  description:
    "One command turns a boring folder into a Git repository — a project Git will protect forever. You're about to feel the moment it clicks.",
  meta: {
    module: "introduction",
    order: 4,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["setup", "repository"],
    summary: [
      "A repository is a folder Git is protecting.",
      "git init turns any folder into a repository.",
      "git init creates a hidden .git folder where Git's memory lives.",
      "A repository starts with no commits — no snapshots yet.",
    ],
    whyItMatters:
      "git init is the very first command in every single Git project on Earth. Master this moment and every future command has somewhere to live.",
    motivation:
      "You made a real repository! Now let's put its first snapshot inside it.",
  },
  learningGoals: [
    "Explain what a repository is in one sentence",
    "Run git init in a folder",
    "Recognize the hidden .git folder",
  ],
  xpReward: 45,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll have a folder that Git promises to protect — and you'll know exactly where Git hides its memory.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Picture a brand-new notebook. Empty pages, full of possibility. A repository is that notebook — except it's a folder on your computer, and Git has promised to remember every page you ever write.",
    },
    {
      type: "callout",
      id: "repo-story",
      tone: "info",
      title: "Repository = folder + Git's memory",
      text: "Before today, a folder is just a folder. The second you run one command, Git walks in, opens its filing cabinet, and starts protecting everything inside. That folder is now a repository.",
    },

    // ---------------------------------------------------------------
    // 1 · Meet the hidden folder.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-hidden",
      level: 2,
      text: "Where Git hides its memory",
    },
    {
      type: "paragraph",
      id: "hidden-question",
      text: "Remember the .git folder from the very first lesson? Watch it appear the moment you run git init.",
    },
    {
      type: "directoryTree",
      id: "directory-init",
      base: "~/project/",
      title: "A folder becomes a repository",
      nodes: [
        {
          name: "project",
          type: "directory",
          children: [
            {
              name: "src",
              type: "directory",
              children: [{ name: "main.js", type: "file" }],
            },
            { name: "README.md", type: "file" },
            {
              name: ".git",
              type: "directory",
              ignored: true,
              highlight: true,
              note: "created by git init",
              children: [
                { name: "HEAD", type: "file", note: "points to your current branch" },
                { name: "index", type: "file", note: "the staging area" },
                {
                  name: "objects",
                  type: "directory",
                  note: "your saved snapshots (empty for now)",
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
      id: "hidden-explain",
      text: "Your files sit on top, exactly as before. Git's filing cabinet (.git) sits underneath, invisible. You never edit .git yourself — Git does, quietly, all the time.",
    },

    // ---------------------------------------------------------------
    // 2 · Run git init for real.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-init",
      level: 2,
      text: "Run the magic command",
    },
    {
      type: "paragraph",
      id: "init-question",
      text: "Open your terminal in the folder you want to protect and type one thing: git init. Watch it work below, then try it yourself in Interactive mode.",
    },
    {
      type: "terminalSteps",
      id: "terminal-init",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My first project\n",
          "src/main.js": "console.log('hi');\n",
        },
        pwd: "~/project",
      },
      steps: [
        {
          command: "git init",
          output: "Initialized empty Git repository in ~/project/.git/",
          outputKind: "success",
          note: "Git built its filing cabinet right inside your folder.",
        },
        {
          command: "git status",
          output: "On branch main\n\nNo commits yet\n\nUntracked files:\n  README.md\n  src/main.js\n\nnothing added to commit but untracked files present",
          outputKind: "muted",
          note: "Git can see your files, but hasn't saved them yet.",
        },
      ],
    },
    {
      type: "callout",
      id: "init-connect",
      tone: "success",
      title: "Reading the answer",
      text: "\"No commits yet\" means your notebook is still empty — no snapshots saved. \"Untracked files\" means Git sees README.md and main.js but isn't watching them yet. Both problems disappear once you save your first snapshot. That's literally the next lesson.",
    },

    // ---------------------------------------------------------------
    // 3 · Common mistake.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-mistake",
      level: 2,
      text: "One common mistake",
    },
    {
      type: "warning",
      id: "mistake-warning",
      title: "Where did you run git init?",
      text: "Run git init inside the folder you want to protect — not in a random folder, and not a level too high. A good rule: if you can't see your project files when you run `ls`, you're in the wrong place.",
    },
    {
      type: "paragraph",
      id: "mistake-note",
      text: "Don't worry about getting it perfect. If you run git init in the wrong folder, it's harmless — you can always delete the .git folder that appears and start over.",
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
        "You just ran git init and git status says \"No commits yet\". In your own words: what does Git's filing cabinet look like right now?",
      hint: "Think about what's in the cabinet when the notebook is brand new.",
      exampleAnswer:
        "The cabinet exists (the .git folder) but it's empty — there are no snapshots in it yet. Git has promised to protect the folder, but hasn't saved any versions because I haven't told it to save.",
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
        id: "quiz-first-repository",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "What is a repository?",
            options: [
              "A folder that Git is protecting",
              "A website for sharing photos",
              "A type of programming language",
              "A backup drive",
            ],
            correctIndex: 0,
            explanation: "A repository is a folder Git watches over, with a hidden .git cabinet full of memory.",
          },
          {
            id: "q2",
            prompt: "Which command turns a folder into a repository?",
            options: ["git init", "git start", "git new", "git folder"],
            correctIndex: 0,
            explanation: "git init creates the hidden .git folder and starts protecting the folder.",
          },
          {
            id: "q3",
            prompt: "Where does Git store its memory?",
            options: [
              "In a hidden .git folder",
              "On the internet automatically",
              "In your browser",
              "In each file itself",
            ],
            correctIndex: 0,
            explanation: "The .git folder is Git's filing cabinet, sitting invisibly inside your project.",
          },
          {
            id: "q4",
            prompt: "After git init, what does \"No commits yet\" mean?",
            options: [
              "Git hasn't saved any snapshots yet",
              "Git is broken",
              "You're offline",
              "Your files are deleted",
            ],
            correctIndex: 0,
            explanation: "It's just an empty notebook — the repository is ready but has no saved snapshots.",
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
        "A repository is a folder Git protects.",
        "git init is the one command that creates it.",
        "It makes a hidden .git folder — Git's filing cabinet.",
        "Your files stay untouched on top.",
        "A fresh repository has no snapshots yet.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Your repository exists. It's watching you. Now let's give it something worth remembering — its very first snapshot.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Saving snapshots",
      text: "The two commands at the heart of Git: git add and git commit. You'll save your first snapshot and see it appear in the timeline.",
    },
  ],
};
