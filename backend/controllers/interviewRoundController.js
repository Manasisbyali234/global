const InterviewRound = require('../models/InterviewRound');
const Job = require('../models/Job');
const { buildUtcDateTimeFromIst } = require('../utils/dateTime');

const mapDayStages = (stages = []) => {
  return stages.map((sub) => ({
    fromDate: buildUtcDateTimeFromIst(sub.fromDate || sub.fromdate || sub.date, '', 'start'),
    startTime: sub.startTime,
    endTime: sub.endTime,
    breakTime: sub.breakTime || 0
  }));
};

const withDayAliases = (roundDocOrObj) => {
  if (!roundDocOrObj) return roundDocOrObj;
  const round = typeof roundDocOrObj.toObject === 'function' ? roundDocOrObj.toObject() : roundDocOrObj;
  const days = round.subStages || [];
  return {
    ...round,
    days,
    daysArray: days
  };
};

// Create interview round
exports.createInterviewRound = async (req, res) => {
  try {
    const {
      jobId,
      key,
      name,
      roundType,
      date,
      startTime,
      endTime,
      applicationLimit,
      description,
      subStages,
      subStagesArray,
      days,
      daysArray,
      schedule,
      scheduleObject,
      schedulesArray,
      daySchedulesArray,
      roomsArray,
      formDataObject,
      savedAt,
      numStudents,
      numHRs,
      remainingStudents,
      maxPossibleInterviews
    } = req.body;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const interviewRound = new InterviewRound({
      jobId,
      key,
      name,
      roundType,
      fromdate: buildUtcDateTimeFromIst(req.body.fromdate || req.body.fromDate || date, '', 'start'),
      todate: buildUtcDateTimeFromIst(
        req.body.todate || req.body.toDate || req.body.fromdate || req.body.fromDate || date,
        '',
        'start'
      ),
      startTime,
      endTime,
      description,
      applicationLimit,
      subStages: mapDayStages(days || daysArray || subStages || subStagesArray || []),
      schedule,
      scheduleObject,
      schedulesArray,
      daySchedulesArray,
      date: req.body.date || date,
      roomsArray,
      numStudents,
      numHRs,
      remainingStudents,
      maxPossibleInterviews,
      formDataObject,
      savedAt
    });

    await interviewRound.save();
    res.status(201).json(withDayAliases(interviewRound));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all interview rounds for a job
exports.getInterviewRoundsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const interviewRounds = await InterviewRound.find({ jobId }).sort({ createdAt: 1 });
    res.status(200).json(interviewRounds.map(withDayAliases));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single interview round
exports.getInterviewRound = async (req, res) => {
  try {
    const { id } = req.params;
    const interviewRound = await InterviewRound.findById(id).populate('jobId');
    if (!interviewRound) {
      return res.status(404).json({ message: 'Interview round not found' });
    }
    res.status(200).json(withDayAliases(interviewRound));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update interview round
exports.updateInterviewRound = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    const inputStages = updates.days || updates.daysArray || updates.subStages || updates.subStagesArray;
    if (updates.fromdate || updates.fromDate || updates.date) {
      updates.fromdate = buildUtcDateTimeFromIst(updates.fromdate || updates.fromDate || updates.date, '', 'start');
    }
    if (updates.todate || updates.toDate || updates.fromdate || updates.fromDate || updates.date) {
      updates.todate = buildUtcDateTimeFromIst(
        updates.todate || updates.toDate || updates.fromdate || updates.fromDate || updates.date,
        '',
        'start'
      );
    }
    if (Array.isArray(inputStages)) {
      updates.subStages = mapDayStages(inputStages);
    }
    delete updates.days;
    delete updates.daysArray;
    delete updates.subStagesArray;

    const interviewRound = await InterviewRound.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!interviewRound) {
      return res.status(404).json({ message: 'Interview round not found' });
    }

    res.status(200).json(withDayAliases(interviewRound));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete interview round
exports.deleteInterviewRound = async (req, res) => {
  try {
    const { id } = req.params;
    const interviewRound = await InterviewRound.findByIdAndDelete(id);

    if (!interviewRound) {
      return res.status(404).json({ message: 'Interview round not found' });
    }

    res.status(200).json({ message: 'Interview round deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
