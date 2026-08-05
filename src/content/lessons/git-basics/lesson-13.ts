import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 13 · git diff
 *
 * The magnifying glass: before/after of any change. Uses the reusable diff
 * viewer (green = added, red = removed) plus a live terminal with git diff and
 * git diff --staged.
 */
export const lesson13: ContentLesson = {
  id: "git-diff",
  slug: "git-diff",
  title: "git diff",
  description:
    "A magnifying glass for your changes. git diff shows exactly which lines you added and removed — green for new, red for gone.",
  meta: {
    module: "git-basics",
    order: 8,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics", "diff"],
    summary: [
      "git diff shows unstaged changes.",
      "git diff --staged shows what's staged.",
      "Green lines are added, red lines are removed.",
      "Diffs are the daily language of Git.",
    ],
    whyItMatters:
      "Before you commit, you check your work with git diff. It's how every developer double-checks what they're about to save — and how teams review each other's code.",
    motivation:
      "You can read a diff now — a skill most people never learn. Next: the undo that saves you when you change something by mistake.",
  },
  learningGoals: [
    "Explain what a diff is",
    "Read added and removed lines",
    "Use git diff and git diff --staged",
  ],
  xpReward: 50,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll read a diff like a book: green means new, red means gone, and you'll know exactly what you're about to commit.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You changed a file. But what exactly changed? Was it one line or twenty? git diff is the magnifying glass that shows every single line, before and after.",
    },
    {
      type: "callout",
      id: "diff-story",
      tone: "info",
      title: "A corrected story",
      text: "Imagine a story that says \"The cat sat on the mat\". You change it to \"The cat sat on the roof\". A diff would show: one line removed in red (the mat), one line added in green (the roof). That's all a diff ever does — show what left and what arrived.",
    },

    // ---------------------------------------------------------------
    // 1 · See a diff.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-see",
      level: 2,
      text: "See a change, line by line",
    },
    {
      type: "paragraph",
      id: "see-question",
      text: "Here's a tiny change in a real file. Watch the removed line glow red and the added line glow green.",
    },
    {
      type: "diffViewer",
      id: "visual-diff",
      title: "What changed in README.md",
      filename: "README.md",
      rows: [
        { left: "# My project", right: "# My project", kind: "context" },
        { left: "A simple project", right: "A simple project", kind: "context" },
        { left: "", right: "", kind: "context" },
        { left: "Run with: npm start", right: "", kind: "remove" },
        { left: "", right: "Run with: npm run dev", kind: "add" },
        { left: "", right: "", kind: "context" },
        { left: "Built with Panda.", right: "Built with Panda.", kind: "context" },
      ],
    },
    {
      type: "callout",
      id: "see-connect",
      tone: "success",
      title: "Two colors, one idea",
      text: "Red (−) lines used to exist and now don't. Green (+) lines are brand new. Git literally paints over the old and writes the new — exactly like a red pen on a corrected story.",
    },

    // ---------------------------------------------------------------
    // 2 · The commands.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-commands",
      level: 2,
      text: "git diff and git diff --staged",
    },
    {
      type: "paragraph",
      id: "commands-question",
      text: "There are two diffs to learn, depending on which room the change is in. Try both below.",
    },
    {
      type: "terminalSteps",
      id: "terminal-diff",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "Run with: npm start\n",
          "index.html": "<h1>hi</h1>\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git add README.md",
          output: "README.md is now staged and ready for its snapshot.",
          outputKind: "success",
        },
        {
          command: "git diff",
          output: "diff --git a/index.html b/index.html\n--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-<h1>hi</h1>\n+<h1>hello</h1>",
          outputKind: "muted",
          note: "git diff shows unstaged changes — the ones not in the staging area yet.",
        },
        {
          command: "git diff --staged",
          output: "diff --git a/README.md b/README.md\n--- a/README.md\n+++ b/README.md\n@@ -1 +1 @@\n-Run with: npm start\n+Run with: npm run dev",
          outputKind: "muted",
          note: "git diff --staged shows exactly what's waiting to be committed.",
        },
      ],
    },
    {
      type: "callout",
      id: "commands-connect",
      tone: "info",
      title: "Two rooms, two diffs",
      text: "git diff looks at the working tree (changes you haven't staged). git diff --staged looks inside the staging area (what your next commit will save). Same colors, different rooms.",
    },

    // ---------------------------------------------------------------
    // 3 · Common mistake.
    // ---------------------------------------------------------------
    {
      type: "warning",
      id: "mistake",
      title: "\"git diff shows nothing, but I edited a file!\"",
      text: "You're probably looking at a staged change. If the file is already in the staging area, use git diff --staged. The plain diff only shows the unstaged room.",
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
        "A diff shows one red line and one green line. In your own words, what happened to that file?",
      hint: "Red = what left, green = what arrived.",
      exampleAnswer:
        "One line was removed (the red one) and a different line was added (the green one). Something in the file was replaced with something new.",
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
        id: "quiz-git-diff",
        title: "Check what you just learned",
        questions: [
          {
            id: "q1",
            prompt: "What does a diff show?",
            options: [
              "Exactly which lines changed, before and after",
              "Your passwords",
              "Your commit count",
              "The file sizes",
            ],
            correctIndex: 0,
            explanation: "A diff is the before/after of your changes, line by line.",
          },
          {
            id: "q2",
            prompt: "Green lines in a diff mean…",
            options: [
              "added — brand new",
              "deleted — removed",
              "unchanged — context",
              "broken",
            ],
            correctIndex: 0,
            explanation: "Green (+) lines are the additions.",
          },
          {
            id: "q3",
            prompt: "Red lines in a diff mean…",
            options: [
              "removed — they used to exist",
              "new — just written",
              "the same as before",
              "secret",
            ],
            correctIndex: 0,
            explanation: "Red (−) lines are what left the file.",
          },
          {
            id: "q4",
            prompt: "To see what's staged, you run…",
            options: [
              "git diff --staged",
              "git diff",
              "git log",
              "git status --deep",
            ],
            correctIndex: 0,
            explanation: "--staged points the diff at the staging area.",
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
        "A diff is the before/after of a change.",
        "Green = added, red = removed.",
        "git diff shows unstaged changes.",
        "git diff --staged shows the staging area.",
        "Check your diff before every commit.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can see what changed. Now the safety net: git restore, for when you change something and immediately regret it.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: git restore",
      text: "The undo for working-tree changes. Make a mistake? Throw it away and go back to the last snapshot.",
    },
  ],
};
