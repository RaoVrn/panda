/**
 * Rough token estimator (characters ÷ 4 ≈ tokens for English text).
 * Input-token quotas count every character sent as the system prompt,
 * history, or user prompt. We measure before each request and keep a hard
 * budget.
 *
 * For production with non-English text or precise billing, swap in a
 * BPE tokenizer (gpt-tokenizer / tiktoken).
 */

export interface TokenStats {
  chars: number;
  estimatedTokens: number;
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateTokensFromLength(chars: number): number {
  return Math.max(1, Math.ceil(chars / 4));
}

export function estimateRequestTokens(parts: Record<string, string>): TokenStats {
  const chars = Object.values(parts).reduce((sum, s) => sum + s.length, 0);
  return { chars, estimatedTokens: estimateTokensFromLength(chars) };
}

/** One-line summary for console logs. */
export function formatTokenSummary(stats: TokenStats): string {
  return `${stats.chars}c ≈ ${stats.estimatedTokens}t`;
}
