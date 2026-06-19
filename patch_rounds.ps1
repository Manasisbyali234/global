$f='c:\Users\Aryan\Desktop\TaleGlobal\global\backend\controllers\candidateController.js'
$t=[IO.File]::ReadAllText($f)

$old="    const trackedStatus = trackedProcess?.status || resolvedTrackedProcess?.status || stage?.status || '';`r`n`r`n    const status = isAssessment && (`r`n`r`n      isFinalAssessmentAttemptStatus(attemptStatus) ||`r`n`r`n      !trackedStatus ||`r`n`r`n      normalizeApplicationStatusValue(trackedStatus) === 'pending'`r`n    )`r`n      ? (attemptStatus || trackedStatus || 'pending')`r`n`r`n      : (trackedStatus || 'pending');"

$new="    const trackedStatus = trackedProcess?.status || resolvedTrackedProcess?.status || stage?.status || '';`r`n`r`n    // For assessments: if the tracked status is a rejection-like value (no_show, failed, etc.)`r`n    // but there is no actual attempt AND the result is pending/absent, treat as pending`r`n    // so a future or unstarted assessment round is not incorrectly shown as rejected.`r`n    const trackedStatusNorm = normalizeApplicationStatusValue(trackedStatus);`r`n    const trackedIsRejectionLike = ['no_show', 'no show', 'expired', 'session expired', 'session_expired', 'failed', 'fail'].includes(trackedStatusNorm);`r`n    const effectiveTrackedStatus = (isAssessment && !assessmentAttempt && trackedIsRejectionLike && !isAssessmentEmployerDecisionStatus(trackedStatus))`r`n      ? 'pending'`r`n      : trackedStatus;`r`n`r`n    const status = isAssessment && (`r`n`r`n      isFinalAssessmentAttemptStatus(attemptStatus) ||`r`n`r`n      !effectiveTrackedStatus ||`r`n`r`n      normalizeApplicationStatusValue(effectiveTrackedStatus) === 'pending'`r`n    )`r`n      ? (attemptStatus || effectiveTrackedStatus || 'pending')`r`n`r`n      : (effectiveTrackedStatus || 'pending');"

Write-Host ('found: '+$t.Contains($old))
$n=$t.Replace($old,$new)
[IO.File]::WriteAllText($f,$n,[Text.Encoding]::UTF8)
Write-Host done
