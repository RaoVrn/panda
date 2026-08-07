import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · GitHub
 *
 * What GitHub is, how it differs from Git, and why it exists. Git is the
 * engine on your computer. GitHub is the website in the cloud where people
 * share projects and work together.
 */
export const lessonGithub: ContentLesson = {
  id: "github",
  slug: "github",
  title: "GitHub",
  description:
    "GitHub is the website where developers share repositories and collaborate. Git is the engine; GitHub is the garage where the cars meet.",
  meta: {
    module: "remote-repositories",
    order: 1,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["github", "remote", "collaboration"],
    summary: [
      "GitHub is a website for hosting repositories.",
      "Git runs on your computer; GitHub lives in the cloud.",
      "GitHub is where teams share and review code.",
      "Git works without GitHub, but they work great together.",
    ],
    whyItMatters:
      "Most real projects live on GitHub. Understanding the difference between Git and GitHub is the first step to collaborating with anyone.",
    motivation:
      "You understand GitHub now. Next, you'll learn how to connect your computer to a remote copy of your project.",
  },
  learningGoals: [
    "Explain what GitHub is",
    "Tell Git apart from GitHub",
    "Know why GitHub exists",
  ],
  xpReward: 45,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
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
    objectives: [
      {
        id: "connect",
        label: "Connect to the remote with git remote add",
        checks: [{ kind: "remoteExists", name: "origin" }],
      },
      {
        id: "inspect",
        label: "Inspect the remote with git remote -v",
        checks: [{ kind: "remoteExists", name: "origin" }],
      },
    ],
    hints: [
      "Connect to your online home with git remote add origin github/my-project.",
      "Look at the saved address with git remote -v.",
    ],
    solution: ["git remote add origin github/my-project", "git remote -v"],
    suggestions: ["git remote add origin github/my-project", "git remote -v"],
    visualizer: { highlight: "head", banner: "GitHub is your project's home in the cloud. A remote is its address" },
    shell: {
      primaryCommand: "git remote add origin github/my-project",
      placeholder: "git remote add",
      quickActions: ["git remote add origin github/my-project", "git remote -v"],
      welcomeText: "Give your project an online address.",
      helperText: "This repo has a home on GitHub. Connect to it with a remote, then inspect it.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll know what GitHub is, why it exists, and exactly how it's different from Git.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You've built a cool project on your computer. You want a friend to see it, or your whole team to work on it together. How do you get it out of your computer?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Your recipe notebook, shared",
      text: "Imagine you keep a recipe notebook (your repository). A friend wants to add their own recipe. You could email pages back and forth, but that gets messy fast. Better: put the notebook on a shared shelf where everyone can reach it. GitHub is that shared shelf.",
    },

    // ---------------------------------------------------------------
    // 1 · Git vs GitHub.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-difference",
      level: 2,
      text: "Git vs GitHub",
    },
    {
      type: "paragraph",
      id: "difference-question",
      text: "Git and GitHub sound alike, but they do different jobs. One is a program on your computer. The other is a website.",
    },
    {
      type: "callout",
      id: "difference-connect",
      tone: "success",
      title: "The engine and the garage",
      text: "Git is the engine that tracks your work, and it runs on your computer. GitHub is the garage in the cloud where you park your repository so others can see and help. You need the engine to move, but the garage is where cars meet.",
    },

    // ---------------------------------------------------------------
    // 2 · Why GitHub exists.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-why",
      level: 2,
      text: "Why GitHub exists",
    },
    {
      type: "paragraph",
      id: "why-question",
      text: "Git keeps history, but it only lives on your computer. If your computer dies, your history dies with it. And teammates can't reach your computer.",
    },
    {
      type: "callout",
      id: "why-connect",
      tone: "info",
      title: "A safe, shared home",
      text: "GitHub holds a copy of your repository in the cloud. It's a backup if anything happens to your computer, and it's a meeting place where a whole team can work on the same project at once.",
    },

    // ---------------------------------------------------------------
    // 3 · When to use GitHub.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-when",
      level: 2,
      text: "When do you use GitHub?",
    },
    {
      type: "paragraph",
      id: "when-question",
      text: "For a project all by yourself on one computer, you only need Git. The moment you want to back it up, share it, or work with others, you add GitHub.",
    },
    {
      type: "callout",
      id: "when-connect",
      tone: "success",
      title: "The rule of thumb",
      text: "Lone experiment, one computer, no sharing? Git is enough. Backing up, showing off, or working as a team? Add GitHub. Most real projects fall into the second group.",
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
      title: "Thinking Git and GitHub are the same",
      text: "People say \"put it on Git\" when they mean GitHub all the time. It's a tiny slip, but the tools are different. Git is the program. GitHub is the website. Both matter, in different ways.",
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
        "Your friend says they put their project on GitHub. Does that mean Git is involved?",
      hint: "GitHub stores repositories. What does Git do?",
      exampleAnswer:
        "Yes, Git is involved. GitHub stores repositories that were made with Git. Git created the history, and GitHub holds a copy of it online.",
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
      id: "tip-github",
      title: "Quick tip",
      text: "Think of GitHub as a shared, safe copy of your repository in the cloud. Everything you can do locally, you can do together on GitHub.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "GitHub is a website for hosting repositories.",
        "Git runs on your computer.",
        "GitHub holds a backup in the cloud.",
        "GitHub is where teams share and review code.",
        "Git and GitHub work together, not against each other.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Now you know what GitHub is. Next, you'll connect your computer to a remote copy of your project so you can push and pull.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git remote",
      text: "Learn how to give your project a saved address for its online home.",
    },
  ],
};
