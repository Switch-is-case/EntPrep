import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let roadmapLimiter: Ratelimit | null = null;
let aiGeneralLimiter: Ratelimit | null = null;
let emailVerificationLimiter: Ratelimit | null = null;
let adminGeneralLimiter: Ratelimit | null = null;
let adminGenerateLimiter: Ratelimit | null = null;
let adminBulkLimiter: Ratelimit | null = null;
let adminUploadLimiter: Ratelimit | null = null;
let adminUsersLimiter: Ratelimit | null = null;

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

  emailVerificationLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/email_verification",
  });

  adminGeneralLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/admin_general",
  });

  adminGenerateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/admin_generate",
  });

  adminBulkLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/admin_bulk",
  });

  adminUploadLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/admin_upload",
  });

  adminUsersLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/admin_users",
  });
} else {
  console.warn(
    "WARNING: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set.\n" +
    "Rate limiting is DISABLED. AI costs are unprotected.\n" +
    "Set these variables before going to production."
  );
}

export type RateLimitType = 
  | "ROADMAP" 
  | "AI_GENERAL" 
  | "EMAIL_VERIFICATION"
  | "ADMIN_GENERAL"
  | "ADMIN_GENERATE"
  | "ADMIN_BULK"
  | "ADMIN_UPLOAD"
  | "ADMIN_USERS";

export async function checkRateLimit(
  userId: string,
  type: RateLimitType
): Promise<{ allowed: boolean; resetAt?: Date; remaining: number }> {
  // If Redis is not configured, disable rate limiting
  if (!redis) {
    return { allowed: true, remaining: 999 };
  }

  let limiter: Ratelimit | null = null;
  
  switch (type) {
    case "ROADMAP": limiter = roadmapLimiter; break;
    case "AI_GENERAL": limiter = aiGeneralLimiter; break;
    case "EMAIL_VERIFICATION": limiter = emailVerificationLimiter; break;
    case "ADMIN_GENERAL": limiter = adminGeneralLimiter; break;
    case "ADMIN_GENERATE": limiter = adminGenerateLimiter; break;
    case "ADMIN_BULK": limiter = adminBulkLimiter; break;
    case "ADMIN_UPLOAD": limiter = adminUploadLimiter; break;
    case "ADMIN_USERS": limiter = adminUsersLimiter; break;
  }

  if (!limiter) {
    return { allowed: true, remaining: 999 };
  }

  const result = await limiter.limit(userId);

  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: new Date(result.reset),
  };
}
