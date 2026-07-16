// In-memory login attempt tracker (per email, server-side)
// Survives across browser tabs/windows since it lives on the server.

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

const attempts = new Map(); // key: "role:email" -> { count, lockedUntil }

const getKey = (role, email) => `${role}:${String(email).trim().toLowerCase()}`;

/**
 * Records a failed login attempt.
 * Returns { locked: true, secondsRemaining } if the account is now locked,
 * or { locked: false, attemptsLeft } otherwise.
 */
const recordFailedAttempt = (role, email) => {
  const key = getKey(role, email);
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, lockedUntil: 0 };

  // If still within an active lockout, just report it
  if (entry.lockedUntil > now) {
    return { locked: true, secondsRemaining: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  // Reset count if previous lockout has expired
  if (entry.lockedUntil > 0 && entry.lockedUntil <= now) {
    entry.count = 0;
    entry.lockedUntil = 0;
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    attempts.set(key, entry);
    return { locked: true, secondsRemaining: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  attempts.set(key, entry);
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - entry.count };
};

/**
 * Checks if a login is currently locked out before attempting.
 * Returns { locked: true, secondsRemaining } or { locked: false }.
 */
const checkLockout = (role, email) => {
  const key = getKey(role, email);
  const entry = attempts.get(key);
  if (!entry || entry.lockedUntil <= Date.now()) return { locked: false };
  return { locked: true, secondsRemaining: Math.ceil((entry.lockedUntil - Date.now()) / 1000) };
};

/**
 * Clears the attempt counter on successful login.
 */
const clearAttempts = (role, email) => {
  attempts.delete(getKey(role, email));
};

module.exports = { recordFailedAttempt, checkLockout, clearAttempts };
