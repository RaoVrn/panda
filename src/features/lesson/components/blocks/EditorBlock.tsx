import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import type { ContentEditorBlock } from "@/content/schema";
import { CodeWindow } from "@/features/lesson/components/blocks/CodeWindow";
import { useLessonMode } from "@/features/lesson/lessonModeContext";
import { cn } from "@/lib/utils";

const LINE_H = 24;
const SIZE = "text-[13px] leading-6";

type Segment = { text: string; added?: boolean };

/** Split a now-ish line against its original counterpart into segments. */
function diffLine(original: string, current: string): Segment[] {
  if (original === current) return [{ text: current }];
  let p = 0;
  while (
    p < original.length &&
    p < current.length &&
    original[p] === current[p]
  )
    p++;
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

export function EditorBlock({ block }: { block: ContentEditorBlock }) {
  const { mode } = useLessonMode();
  const isRead = mode === "read";

  const initial = block.code;
  const originalLines = useRef(initial.split("\n")).current;

  const [value, setValue] = useState("");
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  const modified = !playing && value !== initial;

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const play = useCallback(() => {
    stopTimer();
    setPlaying(true);
    setValue("");
    setHasPlayed(true);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 2;
      const next = initial.slice(0, i);
      setValue(next);
      setActiveLine(next.split("\n").length - 1);
      if (i >= initial.length) {
        stopTimer();
        setPlaying(false);
        taRef.current?.focus();
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

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (playing) return;
    setValue(event.target.value);
  };

  const syncCursor = () => {
    const pos = taRef.current?.selectionStart ?? 0;
    const before = value.slice(0, pos);
    setActiveLine(before.split("\n").length - 1);
  };

  const lines = value.length === 0 ? [""] : value.split("\n");
  const views = buildLineViews(lines, originalLines, playing);

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
                {/* active line highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bg-white/[0.03] transition-transform duration-100"
                  style={{
                    height: LINE_H,
                    top: 12 + activeLine * LINE_H,
                  }}
                />
                {/* diff mirror */}
                <pre
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 overflow-visible whitespace-pre px-4 py-3 font-mono text-[#e6edf3]",
                    SIZE,
                  )}
                >
                  {views.map((v, idx) => (
                    <div key={idx}>
                      {playing &&
                      idx === views.length - 1 &&
                      lines.length - 1 === activeLine &&
                      v.segments.length > 0 ? (
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

                {/* the actual editable surface (real, blinking caret when focused) */}
                <textarea
                  ref={taRef}
                  value={value}
                  onChange={onChange}
                  onSelect={syncCursor}
                  onClick={syncCursor}
                  onKeyUp={syncCursor}
                  rows={Math.max(lines.length, 1)}
                  wrap="off"
                  spellCheck={false}
                  disabled={playing}
                  readOnly={isRead}
                  aria-label={
                    block.filename
                      ? `Edit ${block.filename}`
                      : "Edit code"
                  }
                  className={cn(
                    "relative z-10 w-full resize-none overflow-hidden whitespace-pre bg-transparent px-4 py-3 font-mono text-transparent caret-white selection:bg-white/20",
                    SIZE,
                    playing && "cursor-default",
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/[0.06] bg-[#0d1117] px-4 py-2 font-mono text-[11px]">
            <span className="text-[#8b949e]">{block.filename ?? "untitled"}</span>
            <span className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={play}
                disabled={playing}
                aria-label="Replay typing animation"
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[#8b949e] transition-colors hover:bg-white/[0.06] hover:text-[#e6edf3] disabled:opacity-40"
              >
                <Play className="size-3" aria-hidden="true" />
                Replay
              </button>
              <AnimatePresence mode="wait" initial={false}>
                {modified ? (
                  <motion.span
                    key="modified"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-[#ffa657]"
                  >
                    <span className="size-1.5 rounded-full bg-[#ffa657]" aria-hidden="true" />
                    modified
                  </motion.span>
                ) : (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-[#8b949e]"
                  >
                    <span className="size-1.5 rounded-full bg-[#3fb950]" aria-hidden="true" />
                    {playing ? "typing…" : "saved"}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        </CodeWindow>
      </motion.div>

      <p
        aria-live="polite"
        className={cn(
          "mt-2 px-1 text-xs transition-colors duration-300",
          modified ? "text-warning" : "text-text-muted",
        )}
      >
        {isRead
          ? "Git tracks this file as you watch — press Replay to see it typed again."
          : modified
            ? "Git noticed your change — it’s now a modified file, waiting to be saved."
            : "Try editing the text — Git is watching for changes."}
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