const Application = require('../models/Application');

const normalizeTime = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  // If ISO datetime, extract time
  if (str.includes('T')) {
    const dt = new Date(str);
    if (!Number.isNaN(dt.getTime())) {
      const hours = String(dt.getHours()).padStart(2, '0');
      const minutes = String(dt.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }
  return str;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  const dt = new Date(str);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toISOString().slice(0, 10);
  }
  return str;
};

const parseDateTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;
  const dateStr = normalizeDate(dateValue);
  const [h, m] = String(timeValue).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(h, m, 0, 0);
  return dt;
};

const extractBookingData = (payload = {}) => {
  const root = payload.booking || payload.data || payload;

  const applicationId = root.applicationId || root.application_id;
  const candidateId = root.candidateId || root.candidate_id || root.userId || root.user_id;
  const jobId = root.jobId || root.job_id;
  const roundId = root.roundId || root.round_id || root.interviewRoundId || root.interview_round_id;
  const roundType = root.roundType || root.round_type || root.interviewRoundType;

  const date =
    root.date ||
    root.slotDate ||
    root.interviewDate ||
    root.startDate ||
    root.start_date ||
    root.startAt ||
    root.start_at;

  const startTime =
    root.startTime ||
    root.start_time ||
    root.fromTime ||
    root.from_time ||
    root.start ||
    (root.time && root.time.start) ||
    root.startAt ||
    root.start_at;

  const endTime =
    root.endTime ||
    root.end_time ||
    root.toTime ||
    root.to_time ||
    root.end ||
    (root.time && root.time.end) ||
    root.endAt ||
    root.end_at;

  const interviewerName =
    root.interviewerName ||
    root.interviewer ||
    root.interviewer_name ||
    root.interviewerId?.name ||
    root.host?.name;

  const bookingId = root.bookingId || root.booking_id || root.slotId || root.slot_id;

  return {
    applicationId,
    candidateId,
    jobId,
    roundId,
    roundType,
    date: normalizeDate(date),
    startTime: normalizeTime(startTime),
    endTime: normalizeTime(endTime),
    interviewerName,
    bookingId
  };
};

exports.receiveSchedulerBooking = async (req, res) => {
  try {
    const secret = process.env.SCHEDULER_WEBHOOK_SECRET;
    const providedSecret = req.headers['x-webhook-secret'] || req.headers['x-scheduler-secret'];
    if (secret && providedSecret !== secret) {
      return res.status(401).json({ success: false, message: 'Unauthorized webhook' });
    }

    const booking = extractBookingData(req.body || {});
    if (!booking.candidateId && !booking.applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing candidateId or applicationId in webhook payload'
      });
    }

    let application = null;
    if (booking.applicationId) {
      application = await Application.findById(booking.applicationId);
    }

    if (!application && booking.candidateId && booking.jobId) {
      application = await Application.findOne({
        candidateId: booking.candidateId,
        jobId: booking.jobId
      });
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found for booking' });
    }

    const slotStartAt = parseDateTime(booking.date, booking.startTime);
    const slotEndAt = parseDateTime(booking.date, booking.endTime);

    const slotPayload = {
      roundId: booking.roundId || undefined,
      roundType: booking.roundType || undefined,
      bookingId: booking.bookingId || undefined,
      date: booking.date || undefined,
      startTime: booking.startTime || undefined,
      endTime: booking.endTime || undefined,
      interviewerName: booking.interviewerName || undefined,
      slotStartAt: slotStartAt || undefined,
      slotEndAt: slotEndAt || undefined,
      source: 'scheduler_webhook',
      payload: req.body || {},
      bookedAt: new Date()
    };

    const existingIndex = (application.bookedSlots || []).findIndex((slot) => {
      if (booking.bookingId && slot.bookingId) return slot.bookingId === booking.bookingId;
      if (booking.roundId && slot.roundId) return String(slot.roundId) === String(booking.roundId);
      return false;
    });

    if (existingIndex >= 0) {
      application.bookedSlots[existingIndex] = {
        ...application.bookedSlots[existingIndex],
        ...slotPayload
      };
    } else {
      application.bookedSlots = application.bookedSlots || [];
      application.bookedSlots.push(slotPayload);
    }

    application.markModified('bookedSlots');
    await application.save();

    return res.status(200).json({ success: true, message: 'Booking stored', applicationId: application._id });
  } catch (error) {
    console.error('Scheduler webhook error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process booking webhook' });
  }
};

