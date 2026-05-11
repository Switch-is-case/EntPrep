import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let roadmapLimiter: Ratelimit | null = null;
let aiGeneralLimiter: Ratelimit | null = null;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  roadmapLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "24 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/roadmap",
  });

  aiGeneralLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/ai_general",
  });
} else {
  console.warn(
    "WARNING: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set.\n" +
    "Rate limiting is DISABLED. AI costs are unprotected.\n" +
    "Set these variables before going to production."
  );
}

export type RateLimitType = "ROADMAP" | "AI_GENERAL";

export async function checkRateLimit(
  userId: string,
  type: RateLimitType
): Promise<{ allowed: boolean; resetAt?: Date; remaining: number }> {
  // TODO: Redis not configured — rate limiting disabled in this instance
  if (!redis || !roadmapLimiter || !aiGeneralLimiter) {
    return { allowed: true, remaining: 999 };
  }

  const limiter = type === "ROADMAP" ? roadmapLimiter : aiGeneralLimiter;
  const result = await limiter.limit(userId);

  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: new Date(result.reset),
  };
}
