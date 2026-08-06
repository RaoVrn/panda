import type { ContentLesson } from "@/content/schema";

/**
 * Lesson 3 · Installing Git
 *
 * Zero-programming friendly: what the terminal is, how to check whether Git is
 * installed, and how to install it on Mac, Windows and Linux. No scare-tactics,
 * just a calm tour of the terminal as a "text remote control" for the computer.
 */
export const lesson03: ContentLesson = {
  id: "installing-git",
  slug: "installing-git",
  title: "Installing Git",
  description:
    "Git is a program that lives on your computer. Let's meet the terminal and get Git installed — it takes about two minutes.",
  meta: {
    module: "introduction",
    order: 3,
    difficulty: "beginner",
    durationMinutes: 6,
    tags: ["setup", "terminal"],
    summary: [
      "The terminal is a text window where you talk to your computer.",
      "Check for Git with `git --version`.",
      "If it's missing, install it like any app.",
      "Tell Git who you are with your name and email.",
    ],
    whyItMatters:
      "Every developer you'll ever meet uses a terminal. This is the moment you stop being a spectator and start having a conversation with your computer.",
    motivation:
      "You did it — Git is on your computer. Time to create your first repository!",
  },
  learningGoals: [
    "Recognize a terminal and type one command in it",
    "Check whether Git is installed",
    "Set your Git name and email",
  ],
  xpReward: 40,
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "This lesson is about removing fear of the terminal. By the end, you'll have typed two real commands and Git will know your name.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Developers talk to their computer in a little black window called a terminal. It looks scary, but it's just a text remote control.",
    },
    {
      type: "callout",
      id: "terminal-story",
      tone: "info",
      title: "It's a conversation, not magic",
      text: "You type a command, press Enter, and the computer answers. Like texting a friend — except the friend is your computer, and it never gets tired. Today you'll write two very short texts to it.",
    },

    // ---------------------------------------------------------------
    // 1 · Open the terminal.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-open",
      level: 2,
      text: "Step 1: Open the terminal",
    },
    {
      type: "paragraph",
      id: "open-mac",
      text: "On a Mac, it's called Terminal and lives in Applications → Utilities. On Windows, Git includes a friendly one called Git Bash. On Linux, it's usually right there in your menu — called Terminal.",
    },
    {
      type: "tip",
      id: "open-tip",
      title: "Find it faster",
      text: "On Mac press Cmd + Space and type “Terminal”. On Windows press the Start key and type “Git Bash”. It'll appear in a second.",
    },

    // ---------------------------------------------------------------
    // 2 · Check if Git is installed.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-check",
      level: 2,
      text: "Step 2: Ask your computer about Git",
    },
    {
      type: "paragraph",
      id: "check-question",
      text: "Before installing anything, let's ask the computer if Git is already there. Watch this conversation happen, then try it yourself in Interactive mode.",
    },
    {
      type: "terminalSteps",
      id: "terminal-version",
      title: "panda-shell",
      prompt: "$",
      seed: { files: {}, pwd: "~" },
      steps: [
        {
          command: "git --version",
          output: "git version 2.39.2",
          outputKind: "success",
          note: "The computer answers with the Git version it has. This is all we want to see!",
        },
      ],
    },
    {
      type: "paragraph",
      id: "check-explain",
      text: "If your computer prints something like `git version 2.x`, Git is already installed and you can skip to step 4. If instead it says “command not found”, Git isn't there yet — that's fine, step 3 is for you.",
    },

    // ---------------------------------------------------------------
    // 3 · Install Git.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-install",
      level: 2,
      text: "Step 3: Install Git (only if it's missing)",
    },
    {
      type: "paragraph",
      id: "install-mac",
      text: "Mac: download Git from git-scm.com and open the installer, just like any app. Or, if you enjoy a one-line trick, many people install it with Homebrew: `brew install git`.",
    },
    {
      type: "paragraph",
      id: "install-windows",
      text: "Windows: download it from git-scm.com and install with all the default options. You'll get Git Bash too — a terminal made just for Git.",
    },
    {
      type: "paragraph",
      id: "install-linux",
      text: "Linux: open your terminal and run `sudo apt install git` (on Debian/Ubuntu) or the equivalent for your distribution.",
    },
    {
      type: "warning",
      id: "install-warning",
      title: "Just take the defaults",
      text: "The installer will ask many questions. You don't need to understand any of them. Leave every box as it is and press Next. The defaults are perfect for a beginner.",
    },

    // ---------------------------------------------------------------
    // 4 · Introduce yourself to Git.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-configure",
      level: 2,
      text: "Step 4: Tell Git who you are",
    },
    {
      type: "paragraph",
      id: "configure-question",
      text: "Git stamps every save with a name. So it needs to know yours. These two commands are the only setup you'll ever do — and every snapshot you make will carry your name.",
    },
    {
      type: "terminalSteps",
      id: "terminal-config",
      title: "panda-shell",
      prompt: "$",
      seed: { files: {}, pwd: "~" },
      steps: [
        {
          command: 'git config --global user.name "Panda"',
          output: "",
          outputKind: "muted",
          note: 'Use your own name here instead of "Panda".',
        },
        {
          command: 'git config --global user.email "panda@example.com"',
          output: "",
          outputKind: "muted",
          note: "Use the email you'd want shown next to your work.",
        },
        {
          command: 'git config --global user.name',
          output: "Panda",
          outputKind: "success",
          note: "Git repeats your name back. That means it remembered!",
        },
      ],
    },
    {
      type: "callout",
      id: "configure-connect",
      tone: "success",
      title: "One time only",
      text: "You'll never type these again on this computer. From now on, every snapshot you save is signed with your name — just like writing your name on the top of a test.",
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
        "Explain what a terminal is, in one sentence.",
      hint: "Think about the word “conversation”. What are you doing when you type a command?",
      exampleAnswer:
        "The terminal is just a text window where you talk to your computer. You type a short command, press Enter, and it answers — it's how developers tell their computer what to do.",
    },

    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    // 7 · Takeaways.
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
        "The terminal is a text conversation with your computer.",
        "git --version tells you if Git is installed.",
        "If it's missing, install it from git-scm.com with default options.",
        "git config --global sets your name and email once.",
        "You only ever need these two setup commands.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "Git is installed and it knows your name. Now let's give it its first real job: turning a plain folder into a repository.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "tip",
      title: "Continue to: Creating your first repository",
      text: "One command turns any folder into a Git project. You'll see the magic happen with your own eyes.",
    },
  ],
};
