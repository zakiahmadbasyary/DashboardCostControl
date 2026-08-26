interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Clean up expired rate limit records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const loginRateLimiter = {
  /**
   * Check if IP is currently rate limited
   */
  isRateLimited(ip: string): { limited: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
      return { limited: false, retryAfterSeconds: 0 };
    }

    if (record.resetAt <= now) {
      rateLimitMap.delete(ip);
      return { limited: false, retryAfterSeconds: 0 };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return { limited: true, retryAfterSeconds };
    }

    return { limited: false, retryAfterSeconds: 0 };
  },

  /**
   * Record a failed login attempt for an IP
   */
  recordFailure(ip: string): void {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || record.resetAt <= now) {
      rateLimitMap.set(ip, {
        attempts: 1,
        resetAt: now + WINDOW_MS,
      });
    } else {
      record.attempts += 1;
    }
  },

  /**
   * Reset rate limit count on successful login
   */
  reset(ip: string): void {
    rateLimitMap.delete(ip);
  },
};
