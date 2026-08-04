import type { ContentLesson } from "@/content/schema";

/**
 * lesson-01 — placeholder content used to verify the rendering engine.
 * Authoring real Git content happens separately; this file only proves the
 * renderer can display every block type.
 */
export const lesson01: ContentLesson = {
  id: "lesson-01",
  slug: "introduction-to-git",
  title: "Introduction to Git",
  description:
    "A short placeholder lesson exercising every block in the rendering engine.",
  meta: {
    module: "Introduction",
    order: 1,
    difficulty: "beginner",
    durationMinutes: 8,
    tags: ["basics"],
  },
  blocks: [
    {
      type: "heading",
      id: "heading-welcome",
      level: 1,
      text: "Welcome to Panda",
    },
    {
      type: "paragraph",
      id: "para-intro",
      text: "Every lesson in Panda is built from structured blocks.\nThis paragraph is one block. A terminal, an editor, a directory tree and a quiz are all blocks too.",
    },
    {
      type: "callout",
      id: "callout-learn",
      tone: "tip",
      title: "See it to understand it",
      text: "Visuals come first. Every concept will be shown, not just described.",
    },
    {
      type: "tip",
      id: "tip-practice",
      title: "A tip",
      text: "Try the terminal in the next section — experimentation beats reading.",
    },
    {
      type: "warning",
      id: "warning-safe",
      text: "Everything here runs in a safe environment. Break things freely.",
    },
    {
      type: "spacer",
      id: "spacer-1",
      height: 12,
    },
    {
      type: "divider",
      id: "divider-1",
    },
    {
      type: "heading",
      id: "heading-terminal",
      level: 2,
      text: "Terminal block",
    },
    {
      type: "terminal",
      id: "terminal-demo",
      title: "panda shell",
      prompt: "$",
      lines: [
        { kind: "command", text: "git status" },
        { kind: "output", text: "On branch main" },
        { kind: "output", text: "nothing to commit, working tree clean" },
        { kind: "success", text: "All good." },
      ],
    },
    {
      type: "heading",
      id: "heading-editor",
      level: 2,
      text: "Editor block",
    },
    {
      type: "editor",
      id: "editor-demo",
      language: "bash",
      filename: "demo.sh",
      code: "git init\ngit add .\ngit commit -m \"first commit\"",
    },
    {
      type: "heading",
      id: "heading-code",
      level: 2,
      text: "Code block",
    },
    {
      type: "code",
      id: "code-demo",
      language: "javascript",
      filename: "example.js",
      code: "const branch = \"feature/welcome\";\n// switch to the branch\nconsole.log(branch);",
    },
    {
      type: "heading",
      id: "heading-directory",
      level: 2,
      text: "Directory tree block",
    },
    {
      type: "directoryTree",
      id: "directory-demo",
      base: "project/",
      title: "Repository structure",
      nodes: [
        { name: "src", type: "directory", children: [{ name: "index.ts", type: "file", tracked: true }] },
        { name: "public", type: "directory", children: [{ name: "logo.png", type: "file" }] },
        { name: "package.json", type: "file", tracked: true },
        { name: "README.md", type: "file", tracked: true },
      ],
    },
    {
      type: "heading",
      id: "heading-gitgraph",
      level: 2,
      text: "Git graph block",
    },
    {
      type: "gitGraph",
      id: "graph-demo",
      title: "Branches",
      width: 320,
      height: 120,
      commits: [
        { id: "c1", x: 24, y: 20, lane: 0, label: "main" },
        { id: "c2", x: 70, y: 20, lane: 0 },
        { id: "c3", x: 116, y: 20, lane: 0 },
        { id: "f1", x: 138, y: 60, lane: 1, accent: true, label: "feature" },
        { id: "f2", x: 192, y: 60, lane: 1, accent: true },
      ],
      lines: [
        {
          id: "main",
          points: [
            { x: 24, y: 20 },
            { x: 70, y: 20 },
            { x: 116, y: 20 },
          ],
        },
        {
          id: "feature",
          accent: true,
          points: [
            { x: 116, y: 20 },
            { x: 152, y: 60 },
            { x: 192, y: 60 },
          ],
        },
      ],
    },
    {
      type: "heading",
      id: "heading-image",
      level: 2,
      text: "Image block",
    },
    {
      type: "image",
      id: "image-demo",
      src: "/panda.svg",
      alt: "Panda placeholder",
      caption: "Image blocks render a caption below.",
    },
    {
      type: "heading",
      id: "heading-quiz",
      level: 2,
      text: "Quiz block",
    },
    {
      type: "quiz",
      id: "quiz-demo",
      quiz: {
        id: "quiz-1",
        title: "Check your understanding",
        questions: [
          {
            id: "q1",
            prompt: "Which of these is a Git command?",
            options: ["git commit", "file save", "print doc", "sleep 10"],
            correctIndex: 0,
            explanation: "git commit records a snapshot of your changes.",
          },
        ],
      },
    },
  ],
};