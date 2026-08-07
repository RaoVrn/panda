import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Git Configuration
 *
 * Before Git can save snapshots, it needs to know who you are. Two tiny
 * commands set your name and email once, and every snapshot from then on
 * carries your signature.
 */
export const lessonGitConfiguration: ContentLesson = {
  id: "git-configuration",
  slug: "git-configuration",
  title: "Git Configuration",
  description:
    "Git stamps every snapshot with a name. Two short commands tell Git who you are, and you only ever do it once.",
  meta: {
    module: "git-fundamentals",
    order: 4,
    difficulty: "beginner",
    durationMinutes: 5,
    tags: ["basics", "setup"],
    summary: [
      "Git stamps every snapshot with a name.",
      "git config --global user.name sets your name.",
      "git config --global user.email sets your email.",
      "You only set these once per computer.",
    ],
    whyItMatters:
      "Without a name, Git can't sign your work. These two commands are the only setup you'll ever do, and every future lesson depends on them.",
    motivation:
      "Git knows who you are now. Next, let's look inside a real repository and meet the rooms where your work lives.",
  },
  learningGoals: [
    "Set your Git name and email",
    "Explain why Git needs them",
    "Check your current configuration",
  ],
  xpReward: 40,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end you'll have told Git who you are, and you'll know why every snapshot carries your name.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Think about a school project you hand in. You always write your name on the top. Why? So everyone knows who did the work.",
    },
    {
      type: "callout",
      id: "why-story",
      tone: "info",
      title: "A signed drawing",
      text: "When you finish a drawing, you sign your name on it. Git does the same with every snapshot you save. Your name and email are your signature, stamped on each snapshot automatically.",
    },

    // ---------------------------------------------------------------
    // 1 · The two commands.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-commands",
      level: 2,
      text: "Two commands, once each",
    },
    {
      type: "paragraph",
      id: "commands-question",
      text: "Git needs two pieces of information: your name and your email. Set them both, and you can forget about them forever.",
    },
    {
      type: "terminalSteps",
      id: "terminal-config",
      title: "panda-shell",
      prompt: "$",
      seed: { files: {}, pwd: "~/project" },
      steps: [
        {
          command: 'git config --global user.name "Your Name"',
          output: "",
          outputKind: "success",
          note: "Replace \"Your Name\" with your real name. Git remembers it.",
        },
        {
          command: 'git config --global user.email "you@example.com"',
          output: "",
          outputKind: "success",
          note: "Your email. Git doesn't send anything to it. It just stamps it on your snapshots.",
        },
        {
          command: "git config --list",
          output: "user.name=Your Name\nuser.email=you@example.com",
          outputKind: "output",
          note: "This shows everything Git knows about you. Your settings are here.",
        },
      ],
    },
    {
      type: "callout",
      id: "commands-connect",
      tone: "success",
      title: "What just happened",
      text: "The word --global means \"every project on this computer\". So you set it once, and Git remembers it for every folder you ever track. That's the whole setup.",
    },

    // ---------------------------------------------------------------
    // 2 · What --global means.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-global",
      level: 2,
      text: "The word --global",
    },
    {
      type: "paragraph",
      id: "global-question",
      text: "You might be wondering what --global does. Think of it like a house rule.",
    },
    {
      type: "callout",
      id: "global-story",
      tone: "info",
      title: "House rules",
      text: "A house rule applies to everyone who lives in the house. --global is Git's house rule. It applies to every project on your computer, so you set it once and it works everywhere.",
    },
    {
      type: "warning",
      id: "global-warning",
      title: "Don't skip this step",
      text: "If you try to save a snapshot before setting your name and email, Git will refuse. It needs to know who made the snapshot, or it can't record history properly.",
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
      title: "Typing the command wrong",
      text: "A common slip is writing git config --global user.name Your Name with no quotes. If your name has a space, Git only reads the first word. Always wrap your name and email in quotes.",
    },
    {
      type: "callout",
      id: "mistake-fix",
      tone: "tip",
      title: "Fix it, don't panic",
      text: "Typed something wrong? Just run the command again with the right value. It overwrites the old one. Git doesn't mind at all.",
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
        "You forgot to add quotes around your name, so Git only saved the first word. How do you fix it?",
      hint: "Run the same command again, but wrap the full name in quotes.",
      exampleAnswer:
        "I'd run git config --global user.name \"My Full Name\" again. Git overwrites the old value, so the mistake is fixed in one line.",
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
      id: "tip-config",
      title: "Quick tip",
      text: "Run git config --list anytime to check who Git thinks you are.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "Git stamps your name on every snapshot.",
        "git config --global user.name sets your name.",
        "git config --global user.email sets your email.",
        "--global means every project on your computer.",
        "You set this once and never again.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Git knows who you are now. Next, let's open the hood of a repository and meet the rooms where your work lives.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Repository",
      text: "Time to peek inside the .git folder and learn where Git keeps its memory.",
    },
  ],
};
