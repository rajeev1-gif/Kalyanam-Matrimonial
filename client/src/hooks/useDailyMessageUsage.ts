import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';

export interface DailyUsageData {
  userId: string;
  effectivePlan: 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  planName: string;
  accessSource: 'FREE' | 'PAID' | 'ADMIN';
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  isUnlimited: boolean;
  accessExpiresAt: string | null;
  resetsAt: string;
  resetTimezone: string;
}

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  shortFormatted: string; // e.g. "04h 32m"
}

/**
 * Calculates the exact UTC Date of the next midnight in Asia/Kolkata timezone (UTC+5:30).
 */
export function getNextKolkataMidnightClient(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);

  // Tomorrow at 00:00:00 IST (+05:30)
  const tomorrowUtc = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
  const nextMidnightUtc = new Date(tomorrowUtc.getTime() - (5 * 60 + 30) * 60 * 1000);
  return nextMidnightUtc;
}

export function useDailyMessageUsage(autoRefreshIntervalMs = 60000) {
  const [usage, setUsage] = useState<DailyUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    formatted: '00h 00m 00s',
    shortFormatted: '00h 00m',
  });

  const targetMidnightRef = useRef<number>(getNextKolkataMidnightClient().getTime());

  const fetchUsage = useCallback(async () => {
    try {
      const res = await chatService.getMessageUsage();
      if (res.success && res.data) {
        setUsage(res.data);
        if (res.data.resetsAt) {
          targetMidnightRef.current = new Date(res.data.resetsAt).getTime();
        }
        setError(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch message usage:', err);
      setError(err.message || 'Failed to fetch usage');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Periodic background refresh if enabled
  useEffect(() => {
    if (!autoRefreshIntervalMs) return;
    const interval = setInterval(fetchUsage, autoRefreshIntervalMs);
    return () => clearInterval(interval);
  }, [fetchUsage, autoRefreshIntervalMs]);

  // Second-by-second countdown to Asia/Kolkata midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      let diff = targetMidnightRef.current - now;

      if (diff <= 0) {
        // Midnight crossed in Asia/Kolkata! Fetch new daily quota and advance target
        targetMidnightRef.current = getNextKolkataMidnightClient().getTime();
        fetchUsage();
        diff = Math.max(0, targetMidnightRef.current - Date.now());
      }

      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');

      setCountdown({
        hours,
        minutes,
        seconds,
        formatted: `${hh}h ${mm}m ${ss}s`,
        shortFormatted: `${hh}h ${mm}m`,
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [fetchUsage]);

  return {
    usage,
    loading,
    error,
    countdown,
    refreshUsage: fetchUsage,
  };
}

export default useDailyMessageUsage;

