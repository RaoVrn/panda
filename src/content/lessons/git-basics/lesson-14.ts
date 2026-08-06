import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 14 · git restore
 *
 * The undo for working-tree changes. Sets a file back to the last snapshot —
 * perfect when you change something and wish you hadn't. Also covers
 * git restore --staged (unstage) and what restore does NOT do (it can't
 * undo commits).
 */
export const lesson14: ContentLesson = {
  id: "git-restore",
  slug: "git-restore",
  title: "git restore",
  description:
    "Changed a file and instantly regret it? git restore rewinds it to the last snapshot. Meet the undo button for your working tree.",
  meta: {
    module: "git-basics",
    order: 9,
    difficulty: "beginner",
    durationMinutes: 7,
    tags: ["basics", "restore", "undo"],
    summary: [
      "git restore <file> throws away unstaged changes.",
      "git restore --staged <file> unstages without deleting.",
      "It can't undo commits — those are safe forever.",
      "Check git status first; restore is permanent.",
    ],
    whyItMatters:
      "The courage to experiment comes from knowing you can undo. git restore is that undo for your working tree — a daily safety net.",
    motivation:
      "You know how to undo mistakes now. One more safety tool left in Git Basics — then you'll control exactly what Git pays attention to.",
  },
  learningGoals: [
    "Undo unstaged changes with git restore",
    "Unstage files without losing changes",
    "Know what restore cannot do",
  ],
  xpReward: 50,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end, making a mistake in your working tree will feel like no big deal — because you'll know the one command that makes it vanish.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "You edit a file. You break it. You want it back the way it was ten minutes ago. That's git restore — and it's one of the friendliest commands in Git.",
    },
    {
      type: "callout",
      id: "restore-story",
      tone: "info",
      title: "The crumpled drawing",
      text: "You drew a picture, then added some messy scribbles. git restore is your hand reaching for the crumpled original and smoothing it out — you lose the scribbles, but the drawing you loved is back exactly as it was.",
    },

    // ---------------------------------------------------------------
    // 1 · See the change, then undo it.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-undo",
      level: 2,
      text: "Break it, then fix it",
    },
    {
      type: "paragraph",
      id: "undo-question",
      text: "Here's the file before and after someone made a mess. In the sandbox below, restore it to undo the mess.",
    },
    {
      type: "diffViewer",
      id: "visual-restore",
      title: "Oops. I broke it.",
      filename: "app.js",
      rows: [
        { left: "const greet = (name) => {", right: "const greet = (name) => {", kind: "context" },
        { left: "  console.log('hi');", right: "", kind: "remove" },
        { left: "", right: "  console.log(undefined.name.totally);", kind: "add" },
        { left: "};", right: "};", kind: "context" },
      ],
    },
    {
      type: "terminalSteps",
      id: "terminal-restore",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "app.js": "const greet = (name) => {\n  console.log(undefined.name.totally);\n};\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git status",
          output: "On branch main\nChanges not staged for commit:\n\tmodified:   app.js",
          outputKind: "muted",
          note: "app.js is changed, but not staged. Perfect case for restore.",
        },
        {
          command: "git restore app.js",
          output: "Restored 'app.js' from the last snapshot",
          outputKind: "success",
          note: "The file snaps back to the last committed version. Mess gone.",
        },
        {
          command: "git status",
          output: "On branch main\nnothing to commit, working tree clean",
          outputKind: "success",
          note: "Clean again. It's as if the mistake never happened.",
        },
      ],
    },
    {
      type: "callout",
      id: "undo-connect",
      tone: "success",
      title: "As if it never happened",
      text: "git restore replaces the working-tree file with the last snapshot. Your mistake is erased. Important: it only works on unstaged changes — a file already in the staging area is protected until you unstage it.",
    },

    // ---------------------------------------------------------------
    // 2 · What restore can't do.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-cant",
      level: 2,
      text: "What restore can't do",
    },
    {
      type: "warning",
      id: "cant-warning",
      title: "Commits are forever (until you learn reset)",
      text: "git restore cannot undo a commit. Once you commit, the change is history — which is the whole point! Committed work is safe. (The reset command, much later in the course, is the one that moves your branch pointer around.)",
    },
    {
      type: "paragraph",
      id: "cant-note",
      text: "And remember the two-sided trick: git restore throws away working-tree changes, while git restore --staged just unstages. One destroys the scribbles; the other just takes the file out of the bag — your changes are safe either way.",
    },

    // ---------------------------------------------------------------
    // 3 · Mini challenge.
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
        "Will git restore undo changes to a file you already staged?",
      hint: "Which room does plain git restore act on? What protects a staged file?",
      exampleAnswer:
        "No — plain git restore only undoes unstaged working-tree changes. Since I staged the file, it's in the staging area. I'd need git restore --staged first to unstage, then git restore to get the original back.",
    },

    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    // 5 · Takeaways.
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
        "git restore <file> undoes unstaged changes.",
        "git restore --staged <file> only unstages.",
        "Commits are permanent — restore can't undo them.",
        "Check git status first: restore is a real undo.",
        "The more you can undo, the braver you can be.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "One last tool in Git Basics: telling Git to ignore files entirely. It's the difference between a clean history and one full of junk.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: .gitignore",
      text: "The 'do not look at these' list — how to keep secrets, junk and build files out of your history.",
    },
  ],
};
