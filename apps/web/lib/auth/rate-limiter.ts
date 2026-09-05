import { createHash } from "node:crypto";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(options: RateLimitOptions = { maxAttempts: 5, windowMs: 60_000 }) {
    this.maxAttempts = options.maxAttempts;
    this.windowMs = options.windowMs;
    setInterval(() => this.cleanup(), this.windowMs);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
  }

  private hashKey(key: string): string {
    return createHash("sha256").update(key).digest("hex").slice(0, 32);
  }

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const hashedKey = this.hashKey(key);
    const now = Date.now();
    const entry = this.store.get(hashedKey);

    if (!entry || entry.resetAt < now) {
      this.store.set(hashedKey, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxAttempts - 1, resetAt: now + this.windowMs };
    }

    if (entry.count >= this.maxAttempts) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return { allowed: true, remaining: this.maxAttempts - entry.count, resetAt: entry.resetAt };
  }

  reset(key: string): void {
    const hashedKey = this.hashKey(key);
    this.store.delete(hashedKey);
  }
}

let rateLimiterInstance: InMemoryRateLimiter | null = null;

export function getRateLimiter(options?: RateLimitOptions): InMemoryRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new InMemoryRateLimiter(options);
  }
  return rateLimiterInstance;
}

export function resetRateLimiter(): void {
  rateLimiterInstance = null;
}

export type { RateLimitOptions };
