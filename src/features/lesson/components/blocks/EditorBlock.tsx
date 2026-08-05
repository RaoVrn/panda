import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Play,
  Redo2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { ContentEditorBlock } from "@/content/schema";
import { CodeWindow } from "@/features/lesson/components/blocks/CodeWindow";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { useGitSimStore } from "@/stores/gitSimStore";
import { useReportAi } from "@/stores/aiContextStore";
import { cn } from "@/lib/utils";

const LINE_H = 24;
const SIZE = "text-[13px] leading-6";
const HISTORY_LIMIT = 50;

type Segment = { text: string; added?: boolean };

/** Split a now-ish line against its original counterpart into segments. */
function diffLine(original: string, current: string): Segment[] {
  if (original === current) return [{ text: current }];
  let p = 0;
  while (p < original.length && p < current.length && original[p] === current[p]) p++;
  let s = 0;
  while (
    s < original.length - p &&
    s < current.length - p &&
    original[original.length - 1 - s] === current[current.length - 1 - s]
  )
    s++;
  const added = current.length - s - p;
  const removed = original.length - s - p;
  // Only paint a "green add" when the change is a pure insertion somewhere.
  if (added > 0 && removed === 0) {
    return [
      { text: current.slice(0, p) },
      { text: current.slice(p, p + added), added: true },
      { text: current.slice(p + added) },
    ];
  }
  // Any other modification: highlight the whole line as changed (amber).
  return [{ text: current }];
}

interface LineView {
  segments: Segment[];
  changed: boolean;
}

function buildLineViews(
  current: string[],
  original: string[],
  playing: boolean,
): LineView[] {
  return current.map((line, i) => {
    if (playing) return { segments: [{ text: line }], changed: false };
    if (original[i] === undefined)
      return { segments: [{ text: line, added: true }], changed: true };
    const segments = diffLine(original[i]!, line);
    return { segments, changed: segments.some((x) => x.added) };
  });
}

function IconBtn({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-[#8b949e] transition-colors hover:bg-white/[0.06] hover:text-[#e6edf3] disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  );
}

export function EditorBlock({ block }: { block: ContentEditorBlock }) {
  const { mode } = useLessonMode();
  const isRead = mode === "read";
  const writeFile = useGitSimStore((state) => state.writeFile);

  const initial = block.code;
  const originalLines = useRef(initial.split("\n")).current;

  const [value, setValue] = useState("");
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [past, setPast] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [snapshotAt, setSnapshotAt] = useState<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  const modified = !playing && value !== initial;
  const hasChanges = modified && value.length > 0;

  useReportAi(
    {
      editor: playing
        ? `watching ${block.filename ?? "untitled"} type itself`
        : snapshotAt
          ? `edited ${block.filename ?? "untitled"} and saved a snapshot`
          : value !== initial
            ? `editing ${block.filename ?? "untitled"} (changes not saved yet)`
            : `viewing ${block.filename ?? "untitled"}`,
      sandbox: value.slice(0, 1200),
    },
    [value, playing, snapshotAt, block.filename, initial],
  );

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const play = useCallback(() => {
    stopTimer();
    setPlaying(true);
    setValue("");
    setHasPlayed(true);
    setSnapshotAt(null);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 2;
      const next = initial.slice(0, i);
      setValue(next);
      setActiveLine(next.split("\n").length - 1);
      if (i >= initial.length) {
        stopTimer();
        setPlaying(false);
      }
    }, 26);
  }, [initial]);

  useEffect(() => stopTimer, []);

  useEffect(() => {
    if (playing) return;
    const pos = taRef.current?.selectionStart ?? value.length;
    const before = value.slice(0, pos);
    setActiveLine(before.split("\n").length - 1);
  }, [value, playing]);

  const pushHistory = (current: string) => {
    setPast((prev) => [...prev.slice(-HISTORY_LIMIT), current]);
    setFuture([]);
  };

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (playing) return;
    pushHistory(event.target.value);
    setSnapshotAt(null);
    setValue(event.target.value);
    if (block.filename) writeFile(block.filename, event.target.value);
  };

  const undo = () => {
    if (playing || past.length === 0) return;
    setFuture((prev) => [...prev, value]);
    setValue(past[past.length - 1]!);
    setPast((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (playing || future.length === 0) return;
    setPast((prev) => [...prev, value]);
    setValue(future[future.length - 1]!);
    setFuture((prev) => prev.slice(0, -1));
  };

  const onEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const meta = event.metaKey || event.ctrlKey;
    if (meta && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    } else if (meta && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
    }
  };

  const saveSnapshot = () => {
    if (playing) return;
    if (!hasChanges) return;
    setSnapshotAt(Date.now());
  };

  const syncCursor = () => {
    const pos = taRef.current?.selectionStart ?? 0;
    const before = value.slice(0, pos);
    setActiveLine(before.split("\n").length - 1);
  };

  const lines = value.length === 0 ? [""] : value.split("\n");
  const views = buildLineViews(lines, originalLines, playing);

  const afterLines = (value || initial).split("\n");
  const beforeViews = initial.split("\n").map((line) => ({ text: line }));

  return (
    <div className="group">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        onViewportEnter={() => {
          if (isRead && !hasPlayed) play();
        }}
      >
        <CodeWindow filename={block.filename} language={block.language}>
          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              <div
                aria-hidden="true"
                className="w-10 shrink-0 select-none border-r border-white/[0.03] py-3 pr-3 text-right font-mono text-[12px] leading-6"
              >
                {views.map((v, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "transition-colors",
                      idx === activeLine
                        ? "text-white/70"
                        : v.changed
                          ? "text-[#d29922]"
                          : "text-[#484f58]",
                    )}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>

              <div className="relative flex-1">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bg-white/[0.03] transition-transform duration-100"
                  style={{ height: LINE_H, top: 12 + activeLine * LINE_H }}
                />
                <pre
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 overflow-visible whitespace-pre px-4 py-3 font-mono text-[#e6edf3]",
                    SIZE,
                  )}
                >
                  {views.map((v, idx) => (
                    <div key={idx}>
                      {playing && idx === views.length - 1 && lines.length - 1 === activeLine && v.segments.length > 0 ? (
                        <LastLine segments={v.segments} />
                      ) : (
                        v.segments.map((s, si) => (
                          <span
                            key={si}
                            className={cn(
                              s.added && "rounded-[2px] bg-[#3fb950]/20 text-[#7ee787]",
                              !s.added && v.changed && "text-[#e3b341]",
                            )}
                          >
                            {s.text}
                          </span>
                        ))
                      )}
                    </div>
                  ))}
                  {value.length === 0 && !playing && (
                    <span className="text-[#484f58]">Start typing…</span>
                  )}
                </pre>

                <textarea
                  ref={taRef}
                  value={value}
                  onChange={onChange}
                  onSelect={syncCursor}
                  onClick={syncCursor}
                  onKeyUp={syncCursor}
                  onKeyDown={onEditorKeyDown}
                  rows={Math.max(lines.length, 1)}
                  wrap="off"
                  spellCheck={false}
                  disabled={playing}
                  readOnly={isRead}
                  aria-label={block.filename ? `Edit ${block.filename}` : "Edit code"}
                  className={cn(
                    "relative z-10 w-full resize-none overflow-hidden whitespace-pre bg-transparent px-4 py-3 font-mono text-transparent caret-white selection:bg-white/20",
                    SIZE,
                    playing && "cursor-default",
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-[#0d1117] px-4 py-2 font-mono text-[11px]">
            <span className="text-[#8b949e]">{block.filename ?? "untitled"}</span>
            <span className="ml-auto flex items-center gap-0.5">
              <IconBtn label="Undo (⌘Z)" icon={Undo2} disabled={playing || past.length === 0} onClick={undo} />
              <IconBtn label="Redo (⇧⌘Z)" icon={Redo2} disabled={playing || future.length === 0} onClick={redo} />
              <button
                type="button"
                onClick={play}
                disabled={playing}
                aria-label="Replay typing animation"
                className="flex size-7 items-center justify-center rounded-md text-[#8b949e] transition-colors hover:bg-white/[0.06] hover:text-[#e6edf3] disabled:opacity-40"
              >
                <Play className="size-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={saveSnapshot}
                disabled={playing || !hasChanges || isRead}
                aria-label="Save snapshot"
                title={isRead ? "Switch to Interactive mode to save a snapshot" : "Save a snapshot"}
                className="ml-1 flex h-7 items-center gap-1.5 rounded-md bg-[#3fb950]/15 px-2.5 text-[11px] font-medium text-[#7ee787] transition-colors hover:bg-[#3fb950]/25 disabled:pointer-events-none disabled:opacity-40"
              >
                <Camera className="size-3.5" aria-hidden="true" />
                Save snapshot
              </button>
            </span>
          </div>
        </CodeWindow>
      </motion.div>

      {/* Snapshot compare */}
      <AnimatePresence>
        {snapshotAt && (
          <motion.div
            key="snapshot"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-3 overflow-hidden rounded-2xl border border-accent/30 bg-accent-soft/30"
          >
            <div className="flex items-center gap-2 border-b border-accent/20 px-4 py-2.5">
              <Camera className="size-3.5 text-accent-hover" aria-hidden="true" />
              <p className="text-xs font-semibold text-text">Snapshot saved</p>
              <p className="ml-auto text-[11px] text-text-muted">before → after</p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border-subtle bg-base-subtle/60 px-4 py-3 font-mono text-[13px] leading-6">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Before
                </p>
                {beforeViews.map((s, i) => (
                  <div key={i} className="text-[#8b949e]">
                    {s.text}
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border-subtle bg-base-subtle/60 px-4 py-3 font-mono text-[13px] leading-6">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  After
                </p>
                {afterLines.map((line, i) => {
                  const segments = diffLine(originalLines[i] ?? "", line);
                  return (
                    <div key={i} className="text-[#e6edf3]">
                      {segments.map((s, si) => (
                        <span
                          key={si}
                          className={cn(
                            s.added && "rounded-[2px] bg-[#3fb950]/25 font-medium text-[#7ee787]",
                          )}
                        >
                          {s.text}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-accent/20 px-4 py-2.5">
              <p className="text-xs leading-relaxed text-text-secondary">
                <span className="font-semibold text-text">Git noticed this change.</span>{" "}
                The line that changed is highlighted in green. A snapshot stores it exactly like
                this, forever.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p
        aria-live="polite"
        className={cn(
          "mt-2 px-1 text-xs transition-colors duration-300",
          hasChanges && !snapshotAt ? "text-warning" : "text-text-muted",
        )}
      >
        {isRead
          ? "In Interactive mode you can edit this file, then save a snapshot to watch Git notice."
          : hasChanges && !snapshotAt
            ? "Git sees a change. Press “Save snapshot” to capture it."
            : snapshotAt
              ? "Snapshots are exactly how Git remembers your work."
              : "Make a small edit, then save a snapshot to compare."}
      </p>
    </div>
  );
}

const CARET_CLASS =
  "inline-block h-[15px] w-[2px] translate-y-[2px] rounded-full bg-[#e6edf3]";

/** Renders the final line while typing so a blinking cursor trails the text. */
function LastLine({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, si) => (
        <span key={si} className={s.added ? "text-[#7ee787]" : undefined}>
          {s.text}
        </span>
      ))}
      <motion.span
        className={CARET_CLASS}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.65, 0.75, 1] }}
      />
    </>
  );
}
