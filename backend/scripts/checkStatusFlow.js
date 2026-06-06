#!/usr/bin/env node

/**
 * checkStatusFlow.js
 *
 * Usage:
 *   node checkStatusFlow.js --limit=100
 *   node checkStatusFlow.js --appId=APPLICATION_ID
 *
 * Connects to the MongoDB configured by MONGO_URI (or defaults to localhost)
 * and compares computed application status snapshot with stored application status
 * fields. Prints mismatches and a summary.
 */

const mongoose = require('mongoose');
const minimist = require('minimist');
const path = require('path');

const args = minimist(process.argv.slice(2));
const limit = Number(args.limit || 100);
const appId = args.appId || args.applicationId || null;

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO || 'mongodb://localhost:27017/global';

async function main() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Require models relative to backend/scripts
  const Application = require(path.join(__dirname, '..', 'models', 'Application'));
  const AssessmentAttempt = require(path.join(__dirname, '..', 'models', 'AssessmentAttempt'));
  const InterviewProcess = require(path.join(__dirname, '..', 'models', 'InterviewProcess'));
  const statusUtils = require(path.join(__dirname, '..', 'utils', 'applicationStatus'));

  const query = {};
  if (appId) query._id = appId;

  const apps = await Application.find(query).limit(limit).lean();
  console.log(`Checking ${apps.length} application(s)`);

  let total = 0;
  let mismatches = 0;

  for (const app of apps) {
    total += 1;

    // fetch assessment attempts
    const attempts = await AssessmentAttempt.find({ applicationId: app._id })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate('assessmentId', 'questions.type')
      .lean()
      .catch(() => []);

    const attemptsByAssessmentId = attempts.reduce((acc, attempt) => {
      const aid = String((attempt.assessmentId && attempt.assessmentId._id) || attempt.assessmentId || '').trim();
      if (aid && !acc[aid]) acc[aid] = attempt;
      return acc;
    }, {});

    const interviewProcess = await InterviewProcess.findOne({ applicationId: app._id }).lean().catch(() => null);

    const snapshot = statusUtils.buildApplicationStatusSnapshot(app, {
      assessmentAttemptsByAssessmentId: attemptsByAssessmentId,
      interviewProcess
    });

    const canonicalStored = statusUtils.getCanonicalStatusKey(
      String(app.applicationStatus || app.applicationDisplayStatus || app.displayStatus || app.status || ''),
      'pending'
    );

    if (snapshot.applicationStatus !== canonicalStored) {
      mismatches += 1;
      console.log('--- MISMATCH ---');
      console.log('Application:', String(app._id));
      console.log('Stored status:', canonicalStored);
      console.log('Computed status:', snapshot.applicationStatus);
      console.log('Application base status:', String(app.status || ''));
      console.log('AssessmentStatus/result:', app.assessmentStatus, app.assessmentResult);
      console.log('InterviewProcesses:', Array.isArray(app.interviewProcesses) ? app.interviewProcesses.map(p => `${p.id || p._id}:${p.status}`) : []);
      console.log('---');
    }
  }

  console.log('\nSummary:');
  console.log('Total checked:', total);
  console.log('Mismatches:', mismatches);

  await mongoose.disconnect();
  process.exit(mismatches > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error('Error running checkStatusFlow:', err);
  process.exit(1);
});
