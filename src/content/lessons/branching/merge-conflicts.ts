import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Merge conflicts
 *
 * When two branches change the same line differently, Git can't decide which
 * to keep. That's a merge conflict. This lesson explains why they happen and
 * how to fix them calmly.
 */
export const lessonMergeConflicts: ContentLesson = {
  id: "merge-conflicts",
  slug: "merge-conflicts",
  title: "Merge Conflicts",
  description:
    "Sometimes Git can't merge automatically because two branches changed the same thing. Here's why, and how to fix it without panic.",
  meta: {
    module: "branching",
    order: 6,
    difficulty: "intermediate",
    durationMinutes: 9,
    tags: ["branching", "merge", "conflicts"],
    summary: [
      "A conflict happens when two branches change the same line.",
      "Git marks the spot and asks you to choose.",
      "You pick which version to keep.",
      "Conflicts are normal, not a disaster.",
    ],
    whyItMatters:
      "Conflicts are the one part of merging that scares people. Understanding them turns a scary moment into a simple choice.",
    motivation:
      "You can fix a conflict now. Next, the fastest and cleanest kind of merge: the fast-forward.",
  },
  learningGoals: [
    "Explain what causes a conflict",
    "Recognize when Git needs your help",
    "Know the steps to fix one",
  ],
  xpReward: 50,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "index.html": "<h1>home</h1>\n",
      },
      pwd: "~/project",
      initialized: true,
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      "git switch -c redesign",
      'echo "<h1>new design</h1>" > index.html',
      "git add .",
      'git commit -m "Redesign the page"',
      "git switch main",
      'echo "<h1>homepage</h1>" > index.html',
      "git add .",
      'git commit -m "Update homepage"',
    ],
    objectives: [
      {
        id: "see-branches",
        label: "See both branches have moved apart",
        checks: [{ kind: "branchExists", name: "redesign" }, { kind: "commitCountAtLeast", count: 2 }],
      },
      {
        id: "see-diverged",
        label: "See the same file changed on both branches",
        checks: [
          { kind: "anyCommitMessage", message: "Redesign the page" },
          { kind: "anyCommitMessage", message: "Update homepage" },
        ],
      },
      {
        id: "return",
        label: "Come back to main",
        checks: [{ kind: "branch", name: "main" }],
      },
    ],
    hints: [
      "Run git log --oneline to see that main and redesign both moved.",
      "Notice both branches changed index.html. That's where conflicts come from.",
      "Come back to main with git switch main.",
    ],
    solution: ["git log --oneline", "git switch main"],
    suggestions: ["git log --oneline", "git switch redesign", "git switch main"],
    visualizer: { highlight: "head", banner: "Two branches changed the same file. That's where conflicts come from" },
    shell: {
      primaryCommand: "git switch redesign",
      placeholder: "git switch",
      quickActions: ["git log --oneline", "git switch redesign", "git switch main"],
      welcomeText: "Explore two lines of work.",
      helperText: "Both branches changed index.html. Look at the history and visit each branch.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson a merge conflict won't scare you. You'll know exactly why it happened and what to do.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Two friends edit the same sentence in the same essay, each with a different idea. Which version is right?",
    },
    {
      type: "callout",
      id: "story",
      tone: "warning",
      title: "One sentence, two answers",
      text: "Friend A writes \"The cat is fast.\" Friend B writes \"The cat is lazy.\" You can't keep both. You have to choose. Git faces this exact situation when two branches change the same line.",
    },

    // ---------------------------------------------------------------
    // 1 · Why conflicts happen.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-why",
      level: 2,
      text: "Why conflicts happen",
    },
    {
      type: "paragraph",
      id: "why-question",
      text: "Most merges are automatic. Git combines changes that touch different files or different lines. But when two branches edit the SAME line in different ways, Git can't pick.",
    },
    {
      type: "callout",
      id: "why-connect",
      tone: "info",
      title: "Git stops and asks",
      text: "Git doesn't guess. It stops, shows you both versions, and asks which to keep. That's the conflict. It's Git being careful, not broken.",
    },

    // ---------------------------------------------------------------
    // 2 · What it looks like.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-see",
      level: 2,
      text: "What a conflict looks like",
    },
    {
      type: "paragraph",
      id: "see-question",
      text: "When a file conflicts, Git marks the spot inside the file. It shows your version and the other branch's version, separated by markers.",
    },
    {
      type: "code",
      id: "code-conflict",
      language: "text",
      filename: "index.html",
      code: '<<<<<<< HEAD\n  <h1>My homepage</h1>\n=======\n  <h1>My amazing homepage</h1>\n>>>>>>> feature/redesign',
    },
    {
      type: "callout",
      id: "see-connect",
      tone: "success",
      title: "Reading the markers",
      text: "The top section is your current version. The bottom is the other branch's. You delete the markers, keep the version you want, and save the file.",
    },

    // ---------------------------------------------------------------
    // 3 · Fixing a conflict.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-fix",
      level: 2,
      text: "How to fix it",
    },
    {
      type: "paragraph",
      id: "fix-question",
      text: "Fixing a conflict is four small steps: open the file, choose a version, remove the markers, then commit the merge.",
    },
    {
      type: "callout",
      id: "fix-connect",
      tone: "tip",
      title: "The calm recipe",
      text: "1. Open the file and find the markers. 2. Pick which lines to keep. 3. Delete the <<<<<<<, =======, and >>>>>>> markers. 4. Stage the file and commit. Done.",
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
      title: "Leaving the markers behind",
      text: "A common slip is choosing the right lines but forgetting to delete the <<<<<<<, =======, and >>>>>>> markers. Your file won't work until they're gone. Always double-check.",
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
        "Two branches changed the same line of a file. What does Git do during the merge?",
      hint: "Does Git guess, or does it ask?",
      exampleAnswer:
        "Git doesn't guess. It stops the merge, marks the spot in the file, and asks me to choose which version to keep.",
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
      id: "tip-conflict",
      title: "Quick tip",
      text: "Conflicts are a sign you and someone else both care about the same code. That's not a failure, it's teamwork showing up.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "A conflict happens when two branches change the same line.",
        "Git shows both versions and asks you to choose.",
        "Delete the markers and keep the version you want.",
        "Then commit the merge.",
        "Conflicts are normal and fixable.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can handle a conflict now. But most merges don't conflict at all. Some are so clean they barely count as merges.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Fast-forward merge",
      text: "Meet the simplest merge of all, when Git just slides your branch forward.",
    },
  ],
};
