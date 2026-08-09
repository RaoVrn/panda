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
    "A magnifying glass for your changes. git diff shows exactly which lines you added and removed. Green for new, red for gone.",
  meta: {
    module: "core-commands",
    order: 6,
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
      "Before you commit, you check your work with git diff. It's how every developer double-checks what they're about to save, and how teams review each other's code.",
    motivation:
      "You can read a diff now, a skill most people never learn. Next: the undo that saves you when you change something by mistake.",
  },
  learningGoals: [
    "Explain what a diff is",
    "Read added and removed lines",
    "Use git diff and git diff --staged",
  ],
  xpReward: 50,
    playground: {
      "seed": {
        "files": {
          "README.md": "Run with: npm start\n",
          "index.html": "<h1>hi</h1>\n"
        },
        "pwd": "~/project",
        "initialized": true
      },
      "setup": [
        "git add .",
        "git commit -m \"Start\"",
        "echo \"<h1>hello</h1>\" > index.html"
      ],
      "objectives": [
        {
          "id": "edit-readme",
          "label": "Change README.md to run with npm run dev",
          "checks": [
            {
              "kind": "fileContent",
              "path": "README.md",
              "contains": "npm run dev"
            }
          ]
        },
        {
          "id": "stage-readme",
          "label": "Stage README.md",
          "checks": [
            {
              "kind": "fileStaged",
              "path": "README.md"
            }
          ]
        },
        {
          "id": "keep-index",
          "label": "Keep index.html's change unstaged",
          "persist": false,
          "checks": [
            {
              "kind": "fileNotStaged",
              "path": "index.html"
            },
            {
              "kind": "fileContent",
              "path": "index.html",
              "contains": "<h1>hello"
            }
          ]
        }
      ],
      "hints": [
        "Change the run command in README.md (echo works, or the file editor).",
        "Look at what changed before you stage: git diff.",
        "Stage README.md, leave index.html in the working tree.",
        "Now see the staged side: git diff --staged."
      ],
      "solution": [
        "echo \"Run with: npm run dev\" > README.md",
        "git diff",
        "git add README.md",
        "git diff --staged"
      ],
      "suggestions": [
        "git diff",
        "git diff --staged",
        "echo \"Run with: npm run dev\" > README.md",
        "git add README.md"
      ],
      "visualizer": {
        "highlight": "working-tree",
        "banner": "See exactly what changed, line by line"
      },
      "shell": {
        "primaryCommand": "git diff",
        "placeholder": "git diff",
        "quickActions": [
          "git diff",
          "git diff --staged",
          "git diff README.md"
        ],
        "welcomeText": "Inspect changes like a magnifying glass.",
        "helperText": "git diff shows unstaged changes line by line. Green is new, red is removed. git diff --staged shows what's staged."
      }
    },

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
      text: "Imagine a story that says \"The cat sat on the mat\". You change it to \"The cat sat on the roof\". A diff would show one line removed in red (the mat) and one line added in green (the roof). That's all a diff ever does. It shows what left and what arrived.",
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
      text: "Red (−) lines used to exist and now don't. Green (+) lines are brand new. Git literally paints over the old and writes the new, exactly like a red pen on a corrected story.",
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
      setup: [
        "git add .",
        'git commit -m "Start"',
        'echo "Run with: npm run dev" > README.md',
        'echo "<h1>hello</h1>" > index.html',
      ],
      steps: [
        {
          command: "git add README.md",
          output: "README.md is now staged and ready for its snapshot.",
          outputKind: "success",
        },
        {
          command: "git diff",
          output: "diff --git a/index.html b/index.html\n--- a/index.html\n+++ b/index.html\n@@ -1,1 +1,1 @@\n-<h1>hi</h1>\n+<h1>hello</h1>",
          outputKind: "muted",
          note: "git diff shows unstaged changes, the ones not in the staging area yet.",
        },
        {
          command: "git diff --staged",
          output: "diff --git a/README.md b/README.md\n--- a/README.md\n+++ b/README.md\n@@ -1,1 +1,1 @@\n-Run with: npm start\n+Run with: npm run dev",
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
      type: "heading",
      id: "section-mistake",
      level: 2,
      text: "Common beginner mistake",
    },
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
        "A diff shows one red line and one green line. What happened?",
      hint: "Red = what left, green = what arrived.",
      exampleAnswer:
        "One line was removed (the red one) and a different line was added (the green one). Something in the file was replaced with something new.",
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
      type: "tip",
      id: "tip-git-diff",
      title: "Quick tip",
      text: "Run git diff right before you commit. It's the best way to double-check what you're about to save.",
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
