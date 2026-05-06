import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate, formatTimeToAMPM } from "../utils/dateFormatter";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { getCandidateInterviewReminderAlerts } from "../utils/candidateInterviewReminder";
import "./CandidateInterviewReminder.css";

const STORAGE_KEY = "candidate_interview_reminder_acknowledged";
const POLL_INTERVAL_MS = 60000;
const CLOCK_INTERVAL_MS = 15000;

const loadAcknowledgedAlerts = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [];
  }
};

function CandidateInterviewReminder() {
  const { userType, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(loadAcknowledgedAlerts);
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const audioRef = useRef(null);
  const isCandidateLoggedIn = !authLoading && userType === "candidate";

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncAcknowledgedAlerts = () => {
      setAcknowledgedAlerts(loadAcknowledgedAlerts());
    };

    window.addEventListener("storage", syncAcknowledgedAlerts);
    return () => window.removeEventListener("storage", syncAcknowledgedAlerts);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(acknowledgedAlerts));
  }, [acknowledgedAlerts]);

  useEffect(() => {
    if (!isCandidateLoggedIn) {
      setApplications([]);
      setPendingAlerts([]);
      setActiveAlert(null);
      return undefined;
    }

    let isMounted = true;

    const fetchApplications = async () => {
      try {
        const response = await api.getCandidateApplicationsWithInterviews();
        if (isMounted && response?.success) {
          setApplications(response.applications || response.data || []);
          return;
        }
      } catch {
      }

      try {
        const fallback = await api.getCandidateApplications();
        if (isMounted && fallback?.success) {
          setApplications(fallback.applications || fallback.data || []);
        }
      } catch {
        if (isMounted) {
          setApplications([]);
        }
      }
    };

    fetchApplications();
    const poller = window.setInterval(fetchApplications, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(poller);
    };
  }, [isCandidateLoggedIn]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const intervalId = window.setInterval(() => setNowMs(Date.now()), CLOCK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const dueAlerts = useMemo(
    () => getCandidateInterviewReminderAlerts(applications, acknowledgedAlerts, nowMs),
    [applications, acknowledgedAlerts, nowMs]
  );

  useEffect(() => {
    if (!isCandidateLoggedIn) return;

    setPendingAlerts((previousAlerts) => {
      const existingIds = new Set(previousAlerts.map((alert) => alert.id));
      if (activeAlert?.id) existingIds.add(activeAlert.id);

      const additions = dueAlerts.filter((alert) => !existingIds.has(alert.id));
      if (!additions.length) return previousAlerts;

      return [...previousAlerts, ...additions].sort((left, right) => {
        if (left.startsAtMs !== right.startsAtMs) return left.startsAtMs - right.startsAtMs;
        return left.thresholdMinutes - right.thresholdMinutes;
      });
    });
  }, [dueAlerts, activeAlert, isCandidateLoggedIn]);

  useEffect(() => {
    if (!isCandidateLoggedIn || activeAlert || !pendingAlerts.length) return;

    setActiveAlert(pendingAlerts[0]);
    setPendingAlerts((previousAlerts) => previousAlerts.slice(1));
  }, [activeAlert, pendingAlerts, isCandidateLoggedIn]);

  useEffect(() => {
    if (!activeAlert) {
      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current = null;
      }
      return undefined;
    }

    let ctx = null;
    let stopped = false;
    let timeoutId = null;

    const playSiren = () => {
      if (stopped) return;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return;
      }

      const scheduleCycle = (startTime, iteration) => {
        if (stopped) return;
        // Ambulance: alternates between two tones (high 960Hz → low 760Hz)
        const isHigh = iteration % 2 === 0;
        const freq = isHigh ? 960 : 760;
        const duration = 0.45;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);
        // Slight frequency sweep for siren feel
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
      if (ctx) {
        try { ctx.close(); } catch { /* ignore */ }
        ctx = null;
      }
    };

    audioRef.current = { stop: stopSiren };

    // Start immediately; also restart on user interaction if browser blocked autoplay
    const attemptPlay = () => {
      if (!stopped && !ctx) playSiren();
    };

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

    setAcknowledgedAlerts((previousAlerts) =>
      previousAlerts.includes(activeAlert.id) ? previousAlerts : [...previousAlerts, activeAlert.id]
    );
    setActiveAlert(null);
  };

  if (!isCandidateLoggedIn || !activeAlert) return null;

  const reminderTitle = activeAlert.thresholdMinutes === 10 ? "Interview in 10 minutes" : "Interview in 5 minutes";
  const timingText = `${formatDate(activeAlert.date)} | ${formatTimeToAMPM(activeAlert.startTime)} - ${formatTimeToAMPM(activeAlert.endTime)}`;

  return (
    <div className="candidate-interview-reminder-overlay">
      <div className="candidate-interview-reminder-modal" role="alertdialog" aria-modal="true" aria-labelledby="candidate-interview-reminder-title">
        <div className="candidate-interview-reminder-badge">
          <i className="fa fa-bell candidate-interview-reminder-bell" aria-hidden="true" />
          Upcoming Interview Alert
        </div>
        <h3 id="candidate-interview-reminder-title" className="candidate-interview-reminder-title">
          {reminderTitle}
        </h3>
        <p className="candidate-interview-reminder-copy">
          Your interview is approaching. Please review the details below and stay ready to join on time.
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

export default CandidateInterviewReminder;
