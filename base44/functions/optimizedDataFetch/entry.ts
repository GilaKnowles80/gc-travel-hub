import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(entity, filters) {
  return `${entity}_${JSON.stringify(filters || {})}`;
}

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity, filters = {}, useCache = true, sortBy, limit } = await req.json();

    if (!entity) {
      return Response.json({ error: 'Entity name required' }, { status: 400 });
    }

    const cacheKey = getCacheKey(entity, { filters, sortBy, limit });

    // Check cache first
    if (useCache) {
      const cached = getCached(cacheKey);
      if (cached) {
        return Response.json({
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Fetch data with optimizations
    let data;
    if (Object.keys(filters).length > 0) {
      data = await base44.entities[entity].filter(filters, sortBy, limit);
    } else {
      data = await base44.entities[entity].list(sortBy, limit);
    }

    // Cache the result
    if (useCache) {
      setCache(cacheKey, data);
    }

    return Response.json({
      data,
      cached: false,
      count: data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Optimized fetch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});