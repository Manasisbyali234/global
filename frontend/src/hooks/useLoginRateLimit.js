import { useState, useEffect, useCallback } from 'react';

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 1800;

export function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function useLoginRateLimit(userType) {
    const storageKey = `loginAttempts_${userType}`;
    const lockoutKey = `loginLockout_${userType}`;

    const getLockoutRemaining = () => {
        const lockoutTime = parseInt(localStorage.getItem(lockoutKey) || '0', 10);
        if (!lockoutTime) return 0;
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    };

    const [countdown, setCountdown] = useState(getLockoutRemaining);
    const isLocked = countdown > 0;

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            const remaining = getLockoutRemaining();
            setCountdown(remaining);
            if (remaining <= 0) {
                localStorage.removeItem(lockoutKey);
                localStorage.removeItem(storageKey);
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const recordFailedAttempt = useCallback(() => {
        const attempts = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
        localStorage.setItem(storageKey, attempts);
        if (attempts >= MAX_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_SECONDS * 1000;
            localStorage.setItem(lockoutKey, lockoutUntil);
            setCountdown(LOCKOUT_SECONDS);
        }
    }, [storageKey, lockoutKey]);

    const clearAttempts = useCallback(() => {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(lockoutKey);
        setCountdown(0);
    }, [storageKey, lockoutKey]);

    return { isLocked, countdown, recordFailedAttempt, clearAttempts };
}
