import type { ContentLesson } from "@/content/schema";

/**
 * Lesson · Tags
 *
 * Tags are bookmarks for important versions. They name a commit forever —
 * v1.0, first release — so you can always return to it. Create, list, check
 * out, and push tags to share releases.
 */
export const lessonTags: ContentLesson = {
  id: "tags",
  slug: "tags",
  title: "Tags",
  description:
    "Tags bookmark important versions like v1.0, so you can always jump back to that exact commit. Create, list, visit, and share them.",
  meta: {
    module: "advanced-git",
    order: 7,
    difficulty: "advanced",
    durationMinutes: 10,
    tags: ["advanced-git", "tags", "release"],
    summary: [
      "Tags bookmark important versions.",
      "git tag creates a bookmark at a commit.",
      "Check out a tag to visit that version.",
      "Push tags to share releases.",
    ],
    whyItMatters:
      "Releases are landmarks. Tags name them so you, your team, and your users always know which version is which.",
    motivation:
      "You can mark your releases now. That's the whole Advanced Git module — from stashing work to shipping v1.0.",
  },
  learningGoals: [
    "Explain what a tag is",
    "Create and list tags",
    "Check out a tagged version",
    "Push tags to a remote",
  ],
  xpReward: 55,
  playground: {
    seed: {
      files: {
        "README.md": "My project\n",
        "app.js": "console.log('hi');\n",
      },
      pwd: "~/project",
      initialized: true,
      remote: {
        pwd: "~/project",
        initialized: true,
        files: {},
      },
    },
    setup: [
      "git init",
      "git add .",
      'git commit -m "Start project"',
      'echo "v2" > v2.txt',
      "git add .",
      'git commit -m "Add v2 feature"',
      'echo "v3" > v3.txt',
      "git add .",
      'git commit -m "Add v3 feature"',
    ],
    remoteSetup: ["git init"],
    objectives: [
      {
        id: "create",
        label: "Tag your release v1.0",
        checks: [{ kind: "tagExists", name: "v1.0" }],
      },
      {
        id: "visit",
        label: "Visit the tagged version",
        checks: [{ kind: "detachedHead" }, { kind: "tagExists", name: "v1.0" }],
      },
      {
        id: "share",
        label: "Share tags with the team",
        checks: [{ kind: "remoteTagExists", name: "v1.0" }],
      },
    ],
    hints: [
      "Mark your current commit with git tag v1.0.",
      "See your bookmarks with git tag.",
      "Visit that version with git checkout v1.0. You're now on the released commit.",
      "Come back to a branch with git switch main.",
      "Share the release with git push --tags.",
    ],
    solution: [
      "git tag v1.0",
      "git tag",
      "git checkout v1.0",
      "git switch main",
      "git push --tags",
    ],
    suggestions: ["git tag v1.0", "git tag", "git checkout v1.0", "git switch main", "git push --tags"],
    visualizer: { highlight: "repository", banner: "Tags bookmark important versions so you can always find them again" },
    shell: {
      primaryCommand: "git tag",
      placeholder: "git tag",
      quickActions: ["git tag v1.0", "git tag", "git checkout v1.0", "git push --tags"],
      welcomeText: "Mark your release.",
      helperText: "Tag v1.0, visit it, come back, and share the tag with the team.",
    },
  },
  blocks: [
    {
      type: "learningGoal",
      id: "goal",
      text: "By the end of this lesson you'll mark any version with a tag, find it again, and share it with your team.",
    },
    {
      type: "paragraph",
      id: "open-question",
      text: "Your project is ready to release as version 1.0. How do you make sure you can always find this exact moment again?",
    },
    {
      type: "callout",
      id: "story",
      tone: "info",
      title: "A bookmark in the book",
      text: "Think of a recipe book with bookmarks on your favorite pages. A tag is a bookmark in your Git history, stuck on the page that matters — v1.0, first release, whatever you choose.",
    },

    // ---------------------------------------------------------------
    // 1 · Create a tag.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-create",
      level: 2,
      text: "Create a tag",
    },
    {
      type: "paragraph",
      id: "create-question",
      text: "Stand on the commit you want to remember and give it a name. git tag sticks the name there forever.",
    },
    {
      type: "terminalSteps",
      id: "terminal-tag",
      title: "panda-shell",
      prompt: "$",
      seed: {
        files: {
          "README.md": "My project\n",
          "app.js": "console.log('hi');\n",
        },
        pwd: "~/project",
        initialized: true,
      },
      steps: [
        {
          command: "git tag v1.0",
          output: "tag 'v1.0' created (71f16d9)",
          outputKind: "success",
          note: "v1.0 now points at your current commit.",
        },
        {
          command: "git tag",
          output: "71f16d9 v1.0",
          outputKind: "output",
          note: "Listing tags shows all your bookmarks.",
        },
      ],
    },
    {
      type: "callout",
      id: "create-connect",
      tone: "success",
      title: "A name for a commit",
      text: "The tag v1.0 is a friendly name for one commit. Commits have hashes like 71f16d9; tags give them a name people can remember.",
    },

    // ---------------------------------------------------------------
    // 2 · Visit a tagged version.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-visit",
      level: 2,
      text: "Visit a tagged version",
    },
    {
      type: "paragraph",
      id: "visit-question",
      text: "Months later, a user reports a bug in v1.0. Check out the tag and you're standing on that exact version.",
    },
    {
      type: "callout",
      id: "visit-connect",
      tone: "success",
      title: "Back to the release",
      text: "git checkout v1.0 takes you to that exact commit, just as it was released. Fix the bug, then create a branch to keep your fix.",
    },

    // ---------------------------------------------------------------
    // 3 · Share tags.
    // ---------------------------------------------------------------
    {
      type: "heading",
      id: "section-share",
      level: 2,
      text: "Share tags with the team",
    },
    {
      type: "paragraph",
      id: "share-question",
      text: "Tags don't travel with git push. You send them separately so your team sees the same releases.",
    },
    {
      type: "callout",
      id: "share-connect",
      tone: "warning",
      title: "Push tags by name",
      text: "git push --tags sends all your tags to the remote. Now everyone shares the same bookmarks for v1.0 and beyond.",
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
      title: "Tags don't automatically update",
      text: "A tag is glued to one commit. If you commit more code, the tag stays where it was. To move it, you must delete it and create it again.",
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
        "You just finished v2.0. What commands mark it, show your bookmarks, and share them with the team?",
      hint: "Mark it, list it, then push tags.",
      exampleAnswer:
        "I'd run git tag v2.0 to mark it, git tag to list my bookmarks, and git push --tags to share them with the team.",
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
      id: "tip-tags",
      title: "Quick tip",
      text: "Tag releases, not experiments. Name your tags clearly — v1.0, v2.0 — so anyone on the team knows which version is which.",
    },
    {
      type: "keyTakeaways",
      id: "takeaways",
      items: [
        "Tags bookmark important versions.",
        "git tag v1.0 marks your current commit.",
        "Check out a tag to visit that version.",
        "git push --tags shares releases.",
        "Tags don't move when you commit more.",
      ],
    },
    {
      type: "paragraph",
      id: "close-question",
      text: "You can mark your releases now. That's the whole Advanced Git module, from stashing work to shipping v1.0.",
    },
    {
      type: "callout",
      id: "next-lesson",
      tone: "success",
      title: "You've finished Advanced Git",
      text: "Stash, cherry-pick, reset, revert, rebase, squash, and tags — you now handle Git beyond the basics with confidence.",
    },
  ],
};
