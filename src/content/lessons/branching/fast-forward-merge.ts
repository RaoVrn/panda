import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Fast-forward merge
 *
 * The simplest merge. When main hasn't moved since the branch started, Git
 * just slides main forward to the branch's latest snapshot. No new commit,
 * no conflict, just a clean forward jump.
 */
export const lessonFastForwardMerge: ContentLesson = {
  id: "fast-forward-merge",
  slug: "fast-forward-merge",
  title: "Fast-Forward Merge",
  description:
    "The cleanest merge there is. When main hasn't moved, Git just slides it forward to your branch's latest snapshot.",
  meta: {
    module: "branching",
    order: 7,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["branching", "merge", "fast-forward"],
    summary: [
      "A fast-forward merge slides a branch forward.",
      "It happens when main hasn't moved.",
      "No new merge commit is created.",
      "It's the simplest, cleanest merge.",
    ],
    whyItMatters:
      "Fast-forward merges are the everyday, no-drama merge. Recognizing them means most of your merges feel effortless.",
    motivation:
      "You know the cleanest merge now. That's the whole Branching module. Your history is about to feel powerful.",
  },
  learningGoals: [
    "Explain what a fast-forward merge is",
    "Know when Git uses one",
    "See the branch line move forward",
  ],
  xpReward: 45,
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
      "git switch -c add-cart",
      "touch cart.js",
      "git add .",
      'git commit -m "Add the cart"',
      "touch checkout.js",
      "git add .",
      'git commit -m "Finish the cart"',
      "git switch main",
    ],
    objectives: [
      {
        id: "on-main",
        label: "Stand on main",
        checks: [{ kind: "branch", name: "main" }, { kind: "ranCommand", contains: "git switch main" }],
      },
      {
        id: "merge",
        label: "Merge add-cart into main",
        checks: [{ kind: "anyCommitMessage", message: "Finish the cart" }, { kind: "ranCommand", contains: "git merge add-cart" }],
      },
      {
        id: "straight-line",
        label: "See one clean history line",
        checks: [{ kind: "commitCountAtLeast", count: 3 }, { kind: "ranCommand", contains: "git merge add-cart" }],
      },
    ],
    hints: [
      "Stand on main with git switch main.",
      "Merge the branch with git merge add-cart. It slides forward.",
      "Run git log --oneline to see the clean line.",
    ],
    solution: ["git switch main", "git merge add-cart", "git log --oneline"],
    suggestions: ["git switch main", "git merge add-cart", "git log --oneline"],
    visualizer: { highlight: "head", banner: "A fast-forward merge slides main forward, one clean line" },
    shell: {
      primaryCommand: "git merge add-cart",
      placeholder: "git merge",
      quickActions: ["git switch main", "git merge add-cart", "git log --oneline"],
      welcomeText: "Try the cleanest merge.",
      helperText: "Main hasn't moved. Merge add-cart and watch it slide forward.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll recognize the cleanest merge in Git and know exactly when it happens.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Your branch has two new snapshots. Main hasn't moved since you started. When you merge, there's nothing to combine, just room to move forward.",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "Sliding a bookmark forward",
      text: "Imagine a bookmark on page 5. You read ahead to page 12. Sliding the bookmark to page 12 is a fast-forward. Nothing changed behind you, you just moved ahead.",
    },

    // ---------------------------------------------------------------
    // 1 · The fast-forward.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-ff",
      level: 2,
      text: "Watch it slide",
    },
    {
      type: "paragraph",
      id: "ff-question",
      text: "Here's a feature branch with new work. Main hasn't moved. Watch what a merge does.",
    },
    {
      type: "gitGraph",
      id: "visual-ff",
      title: "Main slides forward",
      width: 340,
      height: 70,
      commits: [
        { id: "c1", x: 30, y: 24, lane: 0, message: "Start project", branch: "main" },
        { id: "c2", x: 120, y: 24, lane: 0, message: "Add the cart", branch: "add-cart" },
        { id: "c3", x: 210, y: 24, lane: 0, message: "Finish the cart", branch: "add-cart", accent: true },
      ],
      lines: [
        {
          id: "timeline",
          points: [
            { x: 30, y: 24 },
            { x: 120, y: 24 },
            { x: 210, y: 24 },
          ],
        },
      ],
    },
    {
      type: "callout",
      id: "ff-connect",
      tone: "success",
      title: "One clean line",
      text: "After a fast-forward merge, main points at the same latest snapshot as add-cart. One line, no extra commit, no conflict. That's the whole trick.",
    },

    // ---------------------------------------------------------------
    // 2 · When it happens.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-when",
      level: 2,
      text: "When does Git use it?",
    },
    {
      type: "paragraph",
      id: "when-question",
      text: "Git uses a fast-forward when the branch you're merging has all of main's snapshots, plus some new ones. Main just catches up.",
    },
    {
      type: "callout",
      id: "when-connect",
      tone: "info",
      title: "The rule of thumb",
      text: "If main hasn't moved since you started your branch, the merge is a fast-forward. If both branches have moved, the merge is no longer a fast-forward. Real Git can create a merge commit in that situation; Panda's simulator currently supports the fast-forward case only.",
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
      title: "Expecting a merge commit every time",
      text: "Not every merge makes a new commit. Fast-forward merges just move the branch pointer. If your history looks like a clean straight line, that's normal, not a mistake.",
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
        "Main hasn't moved and you merge your feature branch. What kind of merge happens?",
      hint: "Is there anything to combine, or just room to move forward?",
      exampleAnswer:
        "A fast-forward merge. Main just slides forward to the feature's latest snapshot, because nothing behind it changed.",
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
      id: "tip-ff",
      title: "Quick tip",
      text: "To keep history clean, merge branches quickly while main hasn't moved. The longer you wait, the more likely you'll need a merge commit.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "A fast-forward slides a branch forward.",
        "It happens when main hasn't moved.",
        "No new merge commit is created.",
        "History stays one clean line.",
        "Most of your early merges will be fast-forwards.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "That's the whole Branching module. You can create branches, move between them, and bring work home cleanly.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "What's next: Remote Repositories",
      text: "Next you'll take your work online and share it with the world on GitHub.",
    },
  ],
};
