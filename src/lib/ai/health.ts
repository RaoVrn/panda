/**
 * Provider/model health tracking.
 *
 * After a route fails `threshold` times in a row it is temporarily disabled
 * for `cooldownMs`, then automatically re-tried (cooldowns are checked lazily,
 * so recovery needs no timer). Success resets the failure streak.
 */

export interface HealthConfig {
  /** Consecutive failures before a route is disabled. */
  threshold: number;
  /** How long a disabled route stays off, in milliseconds. */
  cooldownMs: number;
}

interface HealthRecord {
  consecutiveFailures: number;
  disabledUntil: number;
  lastReason?: string;
}

export class HealthMonitor {
  private readonly records = new Map<string, HealthRecord>();
  private readonly config: HealthConfig;

  constructor(config: HealthConfig) {
    this.config = config;
  }

  /** Whether a route key is currently allowed to be used. */
  isHealthy(key: string): boolean {
    const record = this.records.get(key);
    if (!record || record.consecutiveFailures < this.config.threshold) return true;
    // Lazy recovery: if the cooldown has elapsed, reset and allow it again.
    if (Date.now() >= record.disabledUntil) {
      record.consecutiveFailures = 0;
      return true;
    }
    return false;
  }

  markSuccess(key: string): void {
    const record = this.records.get(key);
    if (record) {
      record.consecutiveFailures = 0;
      record.disabledUntil = 0;
    }
  }

  markFailure(key: string, reason?: string): void {
    const now = Date.now();
    const record = this.records.get(key);
    const failures = (record?.consecutiveFailures ?? 0) + 1;
    this.records.set(key, {
      consecutiveFailures: failures,
      disabledUntil:
        failures >= this.config.threshold
          ? now + this.config.cooldownMs
          : (record?.disabledUntil ?? 0),
      lastReason: reason,
    });
  }

  /** Immediately disables a provider or route after a non-transient failure. */
  disable(key: string, cooldownMs = this.config.cooldownMs, reason?: string): void {
    this.records.set(key, {
      consecutiveFailures: this.config.threshold,
      disabledUntil: Date.now() + cooldownMs,
      lastReason: reason,
    });
  }

  /** Snapshot for logging/debugging (never rendered in the UI). */
  snapshot(): Array<{ key: string; healthy: boolean; failures: number }> {
    return [...this.records.entries()].map(([key, record]) => ({
      key,
      healthy: record.consecutiveFailures < this.config.threshold,
      failures: record.consecutiveFailures,
    }));
  }

  reset(): void {
    this.records.clear();
  }
}
