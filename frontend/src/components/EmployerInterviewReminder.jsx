import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate, formatTimeToAMPM } from "../utils/dateFormatter";
import { useAuth } from "../contexts/AuthContext";
import { getCandidateInterviewReminderAlerts } from "../utils/candidateInterviewReminder";
import { BACKEND_URL } from "../utils/api";
import "./CandidateInterviewReminder.css";

const STORAGE_KEY = "employer_interview_reminder_acknowledged";
const POLL_INTERVAL_MS = 60000;
const CLOCK_INTERVAL_MS = 15000;

const loadAcknowledgedAlerts = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

function EmployerInterviewReminder() {
  const { userType, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(loadAcknowledgedAlerts);
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const audioRef = useRef(null);
  const isEmployerLoggedIn = !authLoading && userType === "employer";

  useEffect(() => {
    const sync = () => setAcknowledgedAlerts(loadAcknowledgedAlerts());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(acknowledgedAlerts));
  }, [acknowledgedAlerts]);

  useEffect(() => {
    if (!isEmployerLoggedIn) {
      setApplications([]);
      setPendingAlerts([]);
      setActiveAlert(null);
      return;
    }

    let isMounted = true;

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("employerToken");
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/api/employer/applications?limit=200`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success) {
          setApplications(data.applications || data.data || []);
        }
      } catch {
        // silently fail
      }
    };

    fetchApplications();
    const poller = window.setInterval(fetchApplications, POLL_INTERVAL_MS);
    return () => {
      isMounted = false;
      window.clearInterval(poller);
    };
  }, [isEmployerLoggedIn]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), CLOCK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const dueAlerts = useMemo(
    () => getCandidateInterviewReminderAlerts(applications, acknowledgedAlerts, nowMs),
    [applications, acknowledgedAlerts, nowMs]
  );

  useEffect(() => {
    if (!isEmployerLoggedIn) return;
    setPendingAlerts((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      if (activeAlert?.id) existingIds.add(activeAlert.id);
      const additions = dueAlerts.filter((a) => !existingIds.has(a.id));
      if (!additions.length) return prev;
      return [...prev, ...additions].sort((a, b) =>
        a.startsAtMs !== b.startsAtMs ? a.startsAtMs - b.startsAtMs : a.thresholdMinutes - b.thresholdMinutes
      );
    });
  }, [dueAlerts, activeAlert, isEmployerLoggedIn]);

  useEffect(() => {
    if (!isEmployerLoggedIn || activeAlert || !pendingAlerts.length) return;
    setActiveAlert(pendingAlerts[0]);
    setPendingAlerts((prev) => prev.slice(1));
  }, [activeAlert, pendingAlerts, isEmployerLoggedIn]);

  useEffect(() => {
    if (!activeAlert) {
      if (audioRef.current) { audioRef.current.stop(); audioRef.current = null; }
      return;
    }

    let ctx = null;
    let stopped = false;
    let timeoutId = null;

    const playSiren = () => {
      if (stopped) return;
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }

      const scheduleCycle = (startTime, iteration) => {
        if (stopped) return;
        const isHigh = iteration % 2 === 0;
        const freq = isHigh ? 960 : 760;
        const duration = 0.45;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.linearRampToValueAtTime(isHigh ? 1020 : 700, startTime + duration);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
        gain.gain.setValueAtTime(0.35, startTime + duration - 0.04);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
        const msUntilNext = (startTime + duration - ctx.currentTime) * 1000;
        timeoutId = window.setTimeout(() => scheduleCycle(ctx.currentTime, iteration + 1), Math.max(0, msUntilNext - 20));
      };

      scheduleCycle(ctx.currentTime, 0);
    };

    const stopSiren = () => {
      stopped = true;
      window.clearTimeout(timeoutId);
      if (ctx) { try { ctx.close(); } catch { } ctx = null; }
    };

    audioRef.current = { stop: stopSiren };

    const attemptPlay = () => { if (!stopped && !ctx) playSiren(); };
    playSiren();
    window.addEventListener("click", attemptPlay, true);
    window.addEventListener("keydown", attemptPlay, true);
    window.addEventListener("touchstart", attemptPlay, true);

    return () => {
      window.removeEventListener("click", attemptPlay, true);
      window.removeEventListener("keydown", attemptPlay, true);
      window.removeEventListener("touchstart", attemptPlay, true);
      stopSiren();
      audioRef.current = null;
    };
  }, [activeAlert]);

  const handleAcknowledge = () => {
    if (!activeAlert) return;
    setAcknowledgedAlerts((prev) =>
      prev.includes(activeAlert.id) ? prev : [...prev, activeAlert.id]
    );
    setActiveAlert(null);
  };

  if (!isEmployerLoggedIn || !activeAlert) return null;

  const reminderTitle = activeAlert.thresholdMinutes === 10 ? "Interview in 10 minutes" : "Interview in 5 minutes";
  const timingText = `${formatDate(activeAlert.date)} | ${formatTimeToAMPM(activeAlert.startTime)} - ${formatTimeToAMPM(activeAlert.endTime)}`;

  return (
    <div className="candidate-interview-reminder-overlay">
      <div className="candidate-interview-reminder-modal" role="alertdialog" aria-modal="true" aria-labelledby="employer-interview-reminder-title">
        <div className="candidate-interview-reminder-badge">
          <i className="fa fa-bell candidate-interview-reminder-bell" aria-hidden="true" />
          Upcoming Interview Alert
        </div>
        <h3 id="employer-interview-reminder-title" className="candidate-interview-reminder-title">
          {reminderTitle}
        </h3>
        <p className="candidate-interview-reminder-copy">
          An interview is scheduled soon. Please ensure the panel is ready and the candidate has been notified.
        </p>

        <div className="candidate-interview-reminder-grid">
          <div className="candidate-interview-reminder-item">
            <span className="candidate-interview-reminder-label">Job Role</span>
            <span className="candidate-interview-reminder-value">{activeAlert.roleTitle}</span>
          </div>
          <div className="candidate-interview-reminder-item">
            <span className="candidate-interview-reminder-label">Interview Type</span>
            <span className="candidate-interview-reminder-value">{activeAlert.roundName}</span>
          </div>
          <div className="candidate-interview-reminder-item">
            <span className="candidate-interview-reminder-label">Company</span>
            <span className="candidate-interview-reminder-value">{activeAlert.companyName}</span>
          </div>
          <div className="candidate-interview-reminder-item">
            <span className="candidate-interview-reminder-label">Timings</span>
            <span className="candidate-interview-reminder-value">{timingText}</span>
          </div>
          {activeAlert.interviewerName ? (
            <div className="candidate-interview-reminder-item">
              <span className="candidate-interview-reminder-label">Interviewer</span>
              <span className="candidate-interview-reminder-value">{activeAlert.interviewerName}</span>
            </div>
          ) : null}
        </div>

        <div className="candidate-interview-reminder-note">
          <i className="fa fa-volume-up" aria-hidden="true" />
          <span>The reminder sound keeps ringing until you click Got it.</span>
        </div>

        <button type="button" className="candidate-interview-reminder-button site-button" onClick={handleAcknowledge}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default EmployerInterviewReminder;
