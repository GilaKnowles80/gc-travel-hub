// In-memory rate limiting store (for production, use Redis or similar)
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: record.resetTime 
    };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  return { allowed: true, remaining: maxRequests - record.count };
}