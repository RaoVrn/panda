/**
 * A short, soft, premium "success chime" for newly unlocked achievements.
 *
 * Synthesized with the Web Audio API (no asset needed). Wrapped defensively:
 * if the browser blocks audio (autoplay rules) or the API is unavailable, it
 * silently no-ops and never throws  -  the visual celebration still works.
 */

let audioContext: AudioContext | null = null;

function context(): AudioContext | null {
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!audioContext) audioContext = new AC();
    if (audioContext.state === "suspended") void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

function playNote(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  peak: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** A gentle two-note chime (E5 → C6), ~0.4s, soft and satisfying. */
export function playAchievementSound(): void {
  try {
    const ctx = context();
    if (!ctx) return;
    const now = ctx.currentTime;
    playNote(ctx, 659.25, now, 0.3, 0.14);
    playNote(ctx, 1046.5, now + 0.16, 0.34, 0.16);
    playNote(ctx, 1318.5, now + 0.34, 0.4, 0.08);
  } catch {
    /* audio unavailable  -  never throw */
  }
}
