/**
 * Session answer cache with a short TTL.
 *
 * Identical (question, action, context) pairs are cached so repeated taps
 * (including the special-action regeneration chips) don't hit the API again.
 * Expired entries are lazily evicted.
 */

import { aiConfig } from "./config";
import type { LessonContext, StyleAction } from "./types";

interface CacheEntry {
  text: string;
  expiresAt: number;
}

const CACHE = new Map<string, CacheEntry>();
const CACHE_LIMIT = 60;

function fingerprint(context: LessonContext): string {
  return [
    context.lessonTitle ?? "",
    context.currentSection ?? "",
    context.mode ?? "",
  ].join("|");
}

function keyFor(
  text: string,
  action: StyleAction | undefined,
  context: LessonContext,
): string {
  return `${fingerprint(context)}|${action ?? ""}|${text.trim().toLowerCase()}`;
}

export function getCached(
  text: string,
  action: StyleAction | undefined,
  context: LessonContext,
): string | undefined {
  const key = keyFor(text, action, context);
  const entry = CACHE.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    CACHE.delete(key);
    return undefined;
  }
  return entry.text;
}

export function setCached(
  text: string,
  action: StyleAction | undefined,
  context: LessonContext,
  answer: string,
): void {
  const key = keyFor(text, action, context);
  CACHE.delete(key);
  CACHE.set(key, {
    text: answer,
    expiresAt: Date.now() + aiConfig.cacheTtlMs,
  });
  if (CACHE.size > CACHE_LIMIT) {
    const oldest = CACHE.keys().next().value;
    if (oldest !== undefined) CACHE.delete(oldest);
  }
}

export function clearCache(): void {
  CACHE.clear();
}
