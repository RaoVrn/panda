import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 2 · Why Git?
 *
 * The story of the mess Git was invented to clean up: losing work, mixing
 * versions, and editing the same file as a friend. Every problem is introduced
 * as something the learner has probably already lived through.
 */
export const lesson02: ContentLesson = {
  id: "why-git",
  slug: "why-git",
  title: "Why Git?",
  description:
    "Before Git, keeping track of work was chaos. Meet the three problems Git was invented to solve — you've probably felt all three.",
  meta: {
    module: "introduction",
    order: 2,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics", "history"],
    summary: [
      "The old way — renaming files — breaks down fast.",
      "Git never lets you lose your work.",
      "Git lets you try things without fear.",
      "Git lets people edit together without stepping on each other.",
    ],
    whyItMatters:
      "Every tool in this course exists to fix one of today's three problems. Understand the problems, and the commands stop feeling like magic.",
    motivation:
      "You've now felt the pain that Git cures. Next you'll install it and feel the relief yourself.",
  },
  learningGoals: [
    "Name the three problems Git solves",
    "Explain why renaming files is a trap",
    "Know why teams need version control",
  ],
  xpReward: 50,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll be able to explain why Git exists to someone who has never heard of it — using your own messy folders as proof.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Have you ever saved a file with a name like this?",
    },
    {
      type: "storyboard",
      id: "story-filenames",
      title: "The most famous folder in the world",
      nodes: [
        { id: "b1", text: "report.doc", icon: "save" },
        { id: "b2", text: "report_final.doc", icon: "save" },
        { id: "b3", text: "report_FINAL.doc", icon: "save" },
        { id: "b4", text: "report_FINAL_v2.doc", icon: "save" },
        { id: "b5", text: "report_FINAL_v2_really.doc", icon: "load" },
        { id: "b6", text: "Wait… which one was the good one?", icon: "skull" },
      ],
    },
    {
      type: "paragraph",
      id: "rename-question",
      text: "That moment — staring at five files that all look the same and having no idea which one is latest — is the exact moment version control was born.",
    },
    {
      type: "callout",
      id: "rename-why",
      tone: "warning",
      title: "Renaming is the old way, and it breaks",
      text: "Renaming a file doesn't tell you what changed, who changed it, or when. Git replaces all five files with one project that remembers every version of itself.",
    },

    // ---------------------------------------------------------------
    // 1 · Problem one: losing work.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-losing",
      level: 2,
      text: "Problem 1: Losing your work",
    },
    {
      type: "paragraph",
      id: "losing-question",
      text: "In the last lesson you learned Git is a time machine. Here's why that matters in real life: every developer, every day, makes mistakes. They delete the wrong file, break something, or save over good work.",
    },
    {
      type: "gitGraph",
      id: "visual-losing",
      title: "What Git protects you from",
      width: 320,
      height: 70,
      commits: [
        {
          id: "c1",
          x: 30,
          y: 24,
          lane: 0,
          message: "working version",
          branch: "main",
          timestamp: "yesterday",
          filesChanged: ["index.html", "style.css"],
        },
        {
          id: "c2",
          x: 96,
          y: 24,
          lane: 0,
          message: "accidental mess",
          branch: "main",
          timestamp: "today",
          filesChanged: ["index.html"],
          accent: true,
        },
        {
          id: "c3",
          x: 162,
          y: 24,
          lane: 0,
          message: "restored",
          branch: "main",
          timestamp: "a second later",
          filesChanged: ["index.html"],
        },
      ],
      lines: [
        {
          id: "timeline",
          points: [
            { x: 30, y: 24 },
            { x: 96, y: 24 },
            { x: 162, y: 24 },
          ],
        },
      ],
    },
    {
      type: "callout",
      id: "losing-connect",
      tone: "success",
      title: "One mistake, zero panic",
      text: "The snapshot from yesterday still exists. You jump back to it, and the mess is gone. Git doesn't prevent mistakes — it makes them harmless. That freedom is why developers try bold things.",
    },

    // ---------------------------------------------------------------
    // 2 · Problem two: mixing things up.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-mixing",
      level: 2,
      text: "Problem 2: Trying things without fear",
    },
    {
      type: "paragraph",
      id: "mixing-question",
      text: "Imagine redecorating your room. What if you could try a wild paint color, live with it for a day, and switch back to the old color in one click? That's problem two: the courage to experiment.",
    },
    {
      type: "paragraph",
      id: "mixing-story",
      text: "Without Git, experimenting means duplicating your project into scary folders named \"backup_after_this\". With Git, you can make a mess, and if you hate it, jump back to the last good snapshot. Try anything. Nothing is permanent.",
    },
    {
      type: "callout",
      id: "mixing-connect",
      tone: "info",
      title: "Safe to break things",
      text: "Git gives you a giant undo button for whole projects. This is the difference between working carefully and working fearlessly.",
    },

    // ---------------------------------------------------------------
    // 3 · Problem three: working together.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-together",
      level: 2,
      text: "Problem 3: Working together",
    },
    {
      type: "paragraph",
      id: "together-question",
      text: "Now the big one. You and your friend are writing a story together. How do you share it without chaos?",
    },
    {
      type: "paragraph",
      id: "together-story",
      text: "Option A: email the file back and forth. Someone always has the older copy, and you can't both type at once. Option B: one person owns the file and the other waits. Both are awful. Git's answer: everyone has their own full copy, everyone works at the same time, and Git carefully stitches the changes together.",
    },
    {
      type: "callout",
      id: "together-connect",
      tone: "success",
      title: "Same project, many cooks",
      text: "That's why GitHub exists and why whole companies run on Git: it's the one tool that lets thousands of people edit the same project without stepping on each other's toes. We'll feel this for real in the GitHub module.",
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
        "Two copies of a project don't match. Which of Git's three problems is this?",
      hint: "Two people changed the same file at the same time. That's the working-together problem — the same one Git solves.",
      exampleAnswer:
        "This is the sharing problem. We both edited our own copies and now they don't match. Git solves it by letting everyone work on their own copy and then carefully merging the changes together.",
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
        "Renaming files to keep versions is a trap.",
        "Problem 1: losing work — Git is your time machine.",
        "Problem 2: experimenting — Git makes mistakes harmless.",
        "Problem 3: teamwork — Git joins everyone's changes.",
        "Understand these problems, and Git's commands make sense.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Convinced? Then let's get Git onto your computer so you can start feeling safe. Ready to install?",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Installing Git",
      text: "A short, painless lesson. You'll check if Git is already installed, and if not, how to get it on your computer.",
    },
  ],
};
