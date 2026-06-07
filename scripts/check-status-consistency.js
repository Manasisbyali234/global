#!/usr/bin/env node

/*
 * Checks whether admin, employer, and candidate APIs expose the same effective
 * application and interview-round statuses for one application.
 *
 * Required:
 *   APPLICATION_ID=...
 *   ADMIN_TOKEN=...       optional, skips admin if omitted
 *   EMPLOYER_TOKEN=...    optional, skips employer if omitted
 *   CANDIDATE_TOKEN=...   optional, skips candidate if omitted
 *
 * Optional:
 *   JOB_ID=...
 *   API_BASE_URL=https://taleglobal.net/api
 *
 * Or pass CLI args:
 *   node scripts/check-status-consistency.js --application=... --job=... --api=https://taleglobal.net/api
 */

const DEFAULT_API_BASE_URL = 'https://taleglobal.net/api';

const STATUS_ALIASES = new Map([
  ['no show', 'no_show'],
  ['session expired', 'session_expired'],
  ['shortlisted for next round', 'shortlisted_for_next_round'],
  ['pending decision', 'pending_decision'],
  ['on hold', 'on_hold'],
  ['not advanced to next stage', 'not_advanced_to_next_stage'],
  ['not advanced to next round', 'not_advanced_to_next_round'],
  ['pass', 'passed'],
  ['fail', 'failed']
]);

const argv = process.argv.slice(2).reduce((acc, item) => {
  const match = item.match(/^--([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

const config = {
  apiBaseUrl: (argv.api || process.env.API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, ''),
  applicationId: argv.application || argv.applicationId || process.env.APPLICATION_ID || '',
  jobId: argv.job || argv.jobId || process.env.JOB_ID || '',
  tokens: {
    admin: argv.adminToken || process.env.ADMIN_TOKEN || '',
    employer: argv.employerToken || process.env.EMPLOYER_TOKEN || '',
    candidate: argv.candidateToken || process.env.CANDIDATE_TOKEN || ''
  }
};

const canonicalStatus = (value = '') => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (!normalized) return '';
  return STATUS_ALIASES.get(normalized) || normalized.replace(/\s+/g, '_');
};

const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') return String(value._id || value.id || value.jobId || value.applicationId || '');
  return String(value);
};

const label = (value) => canonicalStatus(value) || 'missing';

const headersFor = (token) => ({
  Accept: 'application/json',
  Authorization: `Bearer ${token}`
});

const requestJson = async (role, path, token) => {
  const url = `${config.apiBaseUrl}${path}`;
  const response = await fetch(url, { headers: headersFor(token) });
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(`${role} ${path} returned non-JSON (${response.status}): ${text.slice(0, 300)}`);
  }

  if (!response.ok) {
    throw new Error(`${role} ${path} failed (${response.status}): ${JSON.stringify(json).slice(0, 500)}`);
  }

  return { url, json };
};

const collectObjects = (value, output = [], depth = 0) => {
  if (!value || depth > 5) return output;
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, output, depth + 1));
    return output;
  }
  if (typeof value !== 'object') return output;

  if (
    value.applicationId ||
    value._id ||
    value.id ||
    value.status ||
    value.applicationStatus ||
    value.interviewRounds ||
    value.interviewProcesses
  ) {
    output.push(value);
  }

  ['data', 'applications', 'applicants', 'application', 'candidateApplications', 'results'].forEach((key) => {
    if (value[key]) collectObjects(value[key], output, depth + 1);
  });

  return output;
};

const findApplicationRecord = (payload, applicationId) => {
  const records = collectObjects(payload);
  return records.find((record) => {
    const ids = [
      record.applicationId,
      record._id,
      record.id,
      record.application?._id,
      record.application?.applicationId
    ].map(normalizeId);
    return ids.includes(applicationId);
  }) || null;
};

const getJobIdFromRecord = (record = {}) =>
  normalizeId(record.jobId) ||
  normalizeId(record.job) ||
  normalizeId(record.job?._id) ||
  normalizeId(record.jobId?._id);

const buildRoundKey = (round = {}, index = 0) =>
  canonicalStatus(round.type || round.roundType || round.stageType || round.name || round.stageName || round.id || `round_${index}`);

const getRounds = (record = {}) => {
  if (Array.isArray(record.interviewRounds)) return record.interviewRounds;
  if (Array.isArray(record.rounds)) return record.rounds;
  if (Array.isArray(record.interviewDetails?.rounds)) return record.interviewDetails.rounds;
  if (Array.isArray(record.interviewProcesses)) return record.interviewProcesses;
  if (Array.isArray(record.interviewProcess?.stages)) return record.interviewProcess.stages;
  return [];
};

const snapshot = (role, source, record, url) => {
  const rounds = getRounds(record);
  const roundStatuses = rounds.map((round, index) => ({
    index,
    key: buildRoundKey(round, index),
    name: round.name || round.stageName || round.type || round.stageType || `Round ${index + 1}`,
    status: canonicalStatus(round.status || round.assessmentStatus || round.result),
    assessmentResult: canonicalStatus(round.assessmentResult || round.result)
  }));

  return {
    role,
    source,
    url,
    applicationId: normalizeId(record.applicationId || record._id || record.id),
    jobId: getJobIdFromRecord(record),
    status: canonicalStatus(record.status),
    applicationStatus: canonicalStatus(record.applicationStatus),
    applicationDisplayStatus: canonicalStatus(record.applicationDisplayStatus),
    displayStatus: canonicalStatus(record.displayStatus),
    interviewCurrentStatus: canonicalStatus(record.interviewCurrentStatus || record.currentInterviewStatus || record.interviewStatus),
    actualStatus: canonicalStatus(
      record.interviewCurrentStatus ||
      record.applicationDisplayStatus ||
      record.applicationStatus ||
      record.displayStatus ||
      record.status
    ),
    roundStatuses
  };
};

const addSnapshot = (snapshots, role, source, result, record) => {
  if (!record) return;
  snapshots.push(snapshot(role, source, record, result.url));
};

const printSnapshotTable = (snapshots) => {
  console.log('\nStatus snapshot');
  console.table(snapshots.map((item) => ({
    role: item.role,
    source: item.source,
    actualStatus: label(item.actualStatus),
    status: label(item.status),
    applicationStatus: label(item.applicationStatus),
    displayStatus: label(item.displayStatus),
    interviewCurrentStatus: label(item.interviewCurrentStatus),
    rounds: item.roundStatuses.length
  })));
};

const printRoundTable = (snapshots) => {
  console.log('\nRound statuses');
  const rows = [];
  snapshots.forEach((item) => {
    item.roundStatuses.forEach((round) => {
      rows.push({
        role: item.role,
        source: item.source,
        index: round.index + 1,
        key: round.key,
        name: round.name,
        status: label(round.status),
        assessmentResult: label(round.assessmentResult)
      });
    });
  });
  console.table(rows);
};

const compareSnapshots = (snapshots) => {
  const issues = [];
  const comparable = snapshots.filter((item) => item.actualStatus);
  const expectedStatus = comparable[0]?.actualStatus || '';

  comparable.forEach((item) => {
    if (item.actualStatus !== expectedStatus) {
      issues.push(`${item.role}/${item.source} actualStatus=${item.actualStatus}, expected=${expectedStatus}`);
    }
  });

  const roundGroups = new Map();
  snapshots.forEach((item) => {
    item.roundStatuses.forEach((round) => {
      const key = `${round.index}:${round.key}`;
      if (!roundGroups.has(key)) roundGroups.set(key, []);
      roundGroups.get(key).push({ role: item.role, source: item.source, status: round.status || '', name: round.name });
    });
  });

  roundGroups.forEach((rounds, key) => {
    const nonEmpty = rounds.filter((round) => round.status);
    if (nonEmpty.length <= 1) return;
    const expected = nonEmpty[0].status;
    nonEmpty.forEach((round) => {
      if (round.status !== expected) {
        issues.push(`round ${key} ${round.role}/${round.source} status=${round.status}, expected=${expected}`);
      }
    });
  });

  return issues;
};

const main = async () => {
  if (!config.applicationId) {
    throw new Error('APPLICATION_ID is required. Example: APPLICATION_ID=6a243b0c70f9dcbf4256cc80');
  }

  if (!Object.values(config.tokens).some(Boolean)) {
    throw new Error('At least one token is required: ADMIN_TOKEN, EMPLOYER_TOKEN, or CANDIDATE_TOKEN');
  }

  const snapshots = [];
  let resolvedJobId = config.jobId;

  if (config.tokens.candidate) {
    const list = await requestJson('candidate', '/candidate/applications/interviews', config.tokens.candidate);
    const record = findApplicationRecord(list.json, config.applicationId);
    addSnapshot(snapshots, 'candidate', 'applications/interviews', list, record);
    resolvedJobId = resolvedJobId || getJobIdFromRecord(record);

    const status = await requestJson('candidate', `/candidate/applications/${config.applicationId}/status`, config.tokens.candidate);
    addSnapshot(snapshots, 'candidate', 'application/status', status, status.json.application || status.json);

    const details = await requestJson('candidate', `/candidate/applications/${config.applicationId}/interview-details`, config.tokens.candidate);
    addSnapshot(snapshots, 'candidate', 'interview-details', details, {
      applicationId: config.applicationId,
      status: details.json.interviewDetails?.applicationStatus,
      interviewRounds: details.json.interviewDetails?.rounds || []
    });
  }

  if (config.tokens.admin) {
    if (!resolvedJobId) {
      console.warn('Skipping admin: JOB_ID not provided and could not be resolved from candidate response.');
    } else {
      const admin = await requestJson('admin', `/admin/dashboard/jobs/${resolvedJobId}/applicants`, config.tokens.admin);
      const record = findApplicationRecord(admin.json, config.applicationId);
      addSnapshot(snapshots, 'admin', 'job applicants', admin, record);
    }
  }

  if (config.tokens.employer) {
    if (!resolvedJobId) {
      console.warn('Skipping employer: JOB_ID not provided and could not be resolved from candidate response.');
    } else {
      const employer = await requestJson('employer', `/employer/jobs/${resolvedJobId}/applications`, config.tokens.employer);
      const record = findApplicationRecord(employer.json, config.applicationId);
      addSnapshot(snapshots, 'employer', 'job applications', employer, record);

      const details = await requestJson('employer', `/employer/applications/${config.applicationId}`, config.tokens.employer);
      addSnapshot(snapshots, 'employer', 'application details', details, details.json.application || details.json);
    }
  }

  if (snapshots.length === 0) {
    throw new Error('No matching application records found in any API response.');
  }

  printSnapshotTable(snapshots);
  printRoundTable(snapshots);

  const issues = compareSnapshots(snapshots);
  if (issues.length > 0) {
    console.error('\nStatus mismatches found:');
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log('\nAll compared status fields match.');
};

main().catch((error) => {
  console.error(`\ncheck-status-consistency failed: ${error.message}`);
  process.exitCode = 1;
});
