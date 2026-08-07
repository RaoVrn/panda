import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Repository vs Working Tree
 *
 * Two words that sound similar but mean very different things. The working
 * tree is your project folder. The repository is Git's hidden history book
 * inside it. This lesson makes the difference click.
 */
export const lessonRepositoryVsWorkingTree: ContentLesson = {
  id: "repository-vs-working-tree",
  slug: "repository-vs-working-tree",
  title: "Repository vs Working Tree",
  description:
    "The two words people mix up the most. One is your project folder. The other is Git's hidden history book. Let's tell them apart forever.",
  meta: {
    module: "git-fundamentals",
    order: 8,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "repository", "working-tree"],
    summary: [
      "The working tree is your project folder.",
      "The repository is Git's hidden history.",
      "You edit files in the working tree.",
      "Snapshots live in the repository.",
    ],
    whyItMatters:
      "Half of Git confusion comes from these two words. Once they click, commands like status and commit stop feeling random.",
    motivation:
      "The two rooms are clear now. Next, you'll build your very first repository and make your first snapshot.",
  },
  learningGoals: [
    "Tell the working tree apart from the repository",
    "Explain where your files live vs where history lives",
    "Know what Git watches in each room",
  ],
  xpReward: 45,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end, you'll never mix up these two words again. You'll know exactly which room your files are in and which one holds your history.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Imagine a kitchen. The counter where you cook is one thing. The recipe book on the shelf is another. They're both in the kitchen, but they do different jobs.",
    },
    {
      type: "callout",
      id: "why-story",
      tone: "info",
      title: "The kitchen and the recipe book",
      text: "Your project folder is the counter, where you make changes. The .git folder is the recipe book, where Git writes down every version you've made. Same kitchen, two very different things.",
    },

    // ---------------------------------------------------------------
    // 1 · Two rooms.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-rooms",
      level: 2,
      text: "Two rooms, one project",
    },
    {
      type: "paragraph",
      id: "rooms-question",
      text: "When you open a project, you see the working tree. Your files, your folders, everything you edit. But Git also keeps a hidden room called the repository.",
    },
    {
      type: "directoryTree",
      id: "directory-rooms",
      base: "~/project/",
      title: "One folder, two rooms",
      nodes: [
        {
          name: "project",
          type: "directory",
          children: [
            { name: "README.md", type: "file", tracked: true, note: "your file, in the working tree" },
            { name: "src", type: "directory", children: [{ name: "main.js", type: "file", tracked: true }] },
            {
              name: ".git",
              type: "directory",
              ignored: true,
              note: "the repository: Git's history book",
              highlight: true,
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      id: "rooms-explain",
      text: "The working tree is what you see and edit. The repository (.git) is what Git uses to remember. When you commit, you copy your latest work from the working tree into the repository.",
    },
    {
      type: "callout",
      id: "rooms-connect",
      tone: "success",
      title: "One sentence to remember",
      text: "You edit in the working tree. You save into the repository. That's the whole difference.",
    },

    // ---------------------------------------------------------------
    // 2 · Watch it happen.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-live",
      level: 2,
      text: "Watch the rooms work",
    },
    {
      type: "paragraph",
      id: "live-question",
      text: "In the visualizer, your files sit in the working tree. When you commit, they move into the repository. The working tree keeps working; the repository keeps history.",
    },
    {
      type: "stageArea",
      id: "visual-rooms",
      title: "Working tree vs repository",
      commitMessage: "Save my work",
      seed: {
        files: {
          "README.md": "My project\n",
          "src/main.js": "console.log('hi');\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      readFiles: [
        { name: "README.md", status: "new" },
        { name: "src/main.js", status: "new" },
      ],
    },

    // ---------------------------------------------------------------
    // 3 · Common mistake.
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
      title: "Thinking they're the same thing",
      text: "People often say \"my repository\" when they mean \"my project folder\". It's a tiny mix-up, but it causes big confusion. Your folder is the working tree. The repository is Git's history inside it.",
    },
    {
      type: "callout",
      id: "mistake-fix",
      tone: "tip",
      title: "A trick to remember",
      text: "Working tree = what you see. Repository = what Git remembers. If you can open it in your editor, it's the working tree.",
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
        "You just edited a file. Is that a working tree change or a repository change? Why?",
      hint: "Where do you actually edit files? What does the repository hold?",
      exampleAnswer:
        "Editing a file is a working tree change, because the working tree is where I edit. It becomes a repository change only after I commit, which copies it into history.",
    },

    // ---------------------------------------------------------------
    // 5 · What to remember.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-takeaways",
      level: 2,
      text: "What to remember",
    },
    {
      type: "tip",
      id: "tip-rooms",
      title: "Quick tip",
      text: "Run git status and you'll see both rooms at once: files you've changed in the working tree, and files you've staged for the repository.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "The working tree is your project folder.",
        "The repository is Git's hidden history.",
        "You edit in the working tree.",
        "Commits copy work into the repository.",
        "If you can edit it, it's the working tree.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You know both rooms now. Let's put them to work and build your very first repository.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: First Repository",
      text: "One command turns a plain folder into a repository. You're about to feel it click.",
    },
  ],
};
