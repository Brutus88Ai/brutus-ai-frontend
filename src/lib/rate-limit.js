// Simple in-memory rate limiter for serverless functions
const rateLimitMap = new Map();

export function rateLimit(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100;

  return async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
    const key = `${ip}:${req.url}`;
    
    const now = Date.now();
    const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count++;
    rateLimitMap.set(key, record);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetTime + windowMs) {
          rateLimitMap.delete(k);
        }
      }
    }

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      throw new Error('Rate limit exceeded');
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
  };
}
