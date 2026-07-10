import { useState, useEffect, useCallback } from 'react';

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 1800;

export function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function useLoginRateLimit(userType, email = '') {
    const normalizedEmail = email.trim().toLowerCase();
    const storageKey = `loginAttempts_${userType}_${normalizedEmail}`;
    const lockoutKey = `loginLockout_${userType}_${normalizedEmail}`;

    const getLockoutRemaining = useCallback(() => {
        if (!normalizedEmail) return 0;
        const lockoutTime = parseInt(localStorage.getItem(lockoutKey) || '0', 10);
        if (!lockoutTime) return 0;
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    }, [lockoutKey, normalizedEmail]);

    const [countdown, setCountdown] = useState(() => getLockoutRemaining());
    const isLocked = countdown > 0;

    useEffect(() => {
        setCountdown(getLockoutRemaining());
    }, [getLockoutRemaining]);

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
    }, [countdown, getLockoutRemaining, lockoutKey, storageKey]);

    const recordFailedAttempt = useCallback(() => {
        if (!normalizedEmail) return;
        const attempts = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
        localStorage.setItem(storageKey, attempts);
        if (attempts >= MAX_ATTEMPTS) {
            const lockoutUntil = Date.now() + LOCKOUT_SECONDS * 1000;
            localStorage.setItem(lockoutKey, lockoutUntil);
            setCountdown(LOCKOUT_SECONDS);
        }
    }, [storageKey, lockoutKey, normalizedEmail]);

    const clearAttempts = useCallback(() => {
        if (!normalizedEmail) return;
        localStorage.removeItem(storageKey);
        localStorage.removeItem(lockoutKey);
        setCountdown(0);
    }, [storageKey, lockoutKey, normalizedEmail]);

    return { isLocked, countdown, recordFailedAttempt, clearAttempts };
}
