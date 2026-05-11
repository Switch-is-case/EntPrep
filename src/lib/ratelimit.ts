// Простой in-memory rate limiter
const userRequests = new Map<string, number[]>();

const LIMITS = {
  ROADMAP_GENERATE: { 
    max: 3, 
    windowMs: 24 * 60 * 60 * 1000 // 24 часа
  },
  AI_GENERAL: {
    max: 10,
    windowMs: 60 * 60 * 1000 // 1 час
  }
};

export function checkRateLimit(
  userId: string, 
  type: keyof typeof LIMITS
): { allowed: boolean; resetAt?: Date; remaining: number } {
  const limit = LIMITS[type];
  const key = `${type}:${userId}`;
  const now = Date.now();
  
  const requests = userRequests.get(key) || [];
  const recent = requests.filter(t => now - t < limit.windowMs);
  
  if (recent.length >= limit.max) {
    const oldest = Math.min(...recent);
    const resetAt = new Date(oldest + limit.windowMs);
    return { allowed: false, resetAt, remaining: 0 };
  }
  
  recent.push(now);
  userRequests.set(key, recent);
  
  return { 
    allowed: true, 
    remaining: limit.max - recent.length 
  };
}

// Очистка старых записей раз в час
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of userRequests.entries()) {
      const recent = timestamps.filter(t => now - t < 24 * 60 * 60 * 1000);
      if (recent.length === 0) {
        userRequests.delete(key);
      } else {
        userRequests.set(key, recent);
      }
    }
  }, 60 * 60 * 1000);
}
