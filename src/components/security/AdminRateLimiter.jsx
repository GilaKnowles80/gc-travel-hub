import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const RateLimitContext = createContext();

export const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within RateLimitProvider');
  }
  return context;
};

export const RateLimitProvider = ({ children }) => {
  const checkRateLimit = async (action, identifier) => {
    try {
      const userEmail = (await base44.auth.me())?.email || 'anonymous';
      const key = `${action}_${identifier || userEmail}`;
      
      // Store rate limit attempts in localStorage for client-side tracking
      const storageKey = `ratelimit_${key}`;
      const attempts = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0, "resetTime": 0}');
      const now = Date.now();
      
      // Reset if time window passed (1 minute)
      if (now > attempts.resetTime) {
        attempts.count = 0;
        attempts.resetTime = now + 60000; // 1 minute
      }
      
      // Check if exceeded limit (10 requests per minute)
      if (attempts.count >= 10) {
        const secondsLeft = Math.ceil((attempts.resetTime - now) / 1000);
        toast.error(`Too many requests. Please wait ${secondsLeft} seconds.`);
        return false;
      }
      
      // Increment counter
      attempts.count++;
      localStorage.setItem(storageKey, JSON.stringify(attempts));
      
      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error to not block legitimate users
    }
  };

  return (
    <RateLimitContext.Provider value={{ checkRateLimit }}>
      {children}
    </RateLimitContext.Provider>
  );
};