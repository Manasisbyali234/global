import { useState, useEffect, useRef, useCallback } from 'react';

export function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

/**
 * Server-driven login rate limiter.
 * The lockout is enforced by the backend and returned as `secondsRemaining`
 * in the login response. This hook just manages the countdown display.
 */
export function useLoginRateLimit() {
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

    const isLocked = countdown > 0;

    const startLockout = useCallback((seconds) => {
        clearInterval(timerRef.current);
        setCountdown(seconds);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const clearAttempts = useCallback(() => {
        clearInterval(timerRef.current);
        setCountdown(0);
    }, []);

    useEffect(() => () => clearInterval(timerRef.current), []);

    return { isLocked, countdown, startLockout, clearAttempts };
}
