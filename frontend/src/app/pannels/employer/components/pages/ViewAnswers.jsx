import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../../../../utils/api';
import { decodeAssessmentText, formatAssessmentContent } from '../../../../../utils/assessmentContent';
import { getAssessmentOutcomeLabel } from '../../../../../utils/assessmentOutcome';
import { showError, showSuccess, showConfirmation } from '../../../../../utils/popupNotification';

export default function ViewAnswers() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL
    || (window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : `${window.location.origin}/api`);
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluationDrafts, setEvaluationDrafts] = useState({});
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  const [marksErrors, setMarksErrors] = useState({});

  const resolveFileUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  const OBJECTIVE_QUESTION_TYPES = new Set(['mcq', 'visual-mcq', 'questionary-image-mcq', 'image-mcq']);
  const MANUAL_QUESTION_TYPES = new Set(['subjective', 'image', 'upload']);

  const isObjectiveQuestionType = (questionType = '') => OBJECTIVE_QUESTION_TYPES.has(String(questionType || '').trim());
  const isManualQuestionType = (questionType = '') => MANUAL_QUESTION_TYPES.has(String(questionType || '').trim());
  const hasManualResponse = (answer = {}) =>
    Boolean(
      (typeof answer?.textAnswer === 'string' && answer.textAnswer.trim()) ||
      answer?.uploadedFile?.path ||
      answer?.uploadedFile?.originalName ||
      answer?.uploadedFile?.filename ||
      answer?.uploadedFile?.data
    );

  const buildEvaluationDrafts = (attemptData) => {
    const questions = attemptData?.assessmentId?.questions || [];
    return (attemptData?.answers || []).reduce((acc, answer) => {
      const question = questions?.[answer?.questionIndex];
      if (question && isManualQuestionType(question.type)) {
        acc[answer.questionIndex] = {
          awardedMarks: answer?.awardedMarks ?? ''
        };
      }
      return acc;
    }, {});
  };

  const getResultLabel = (attemptData) => {
    if (!attemptData) return 'Pending';
    return getAssessmentOutcomeLabel({
      status: attemptData.status,
      result: attemptData.result,
      manualEvaluationPendingCount: attemptData.manualEvaluationPendingCount
    });
  };

  useEffect(() => {
    fetchAnswers();
  }, [attemptId]);

  const fetchAnswers = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      console.log('Fetching answers for attemptId:', attemptId);
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await axios.get(`${API_BASE_URL}/employer/assessment-attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        console.log('Full attempt data:', JSON.stringify(response.data.attempt, null, 2));
        response.data.attempt.answers?.forEach((ans, idx) => {
          console.log(`Answer ${idx}:`, {
            questionIndex: ans.questionIndex,
            selectedAnswer: ans.selectedAnswer,
            textAnswer: ans.textAnswer,
            textAnswerType: typeof ans.textAnswer,
            textAnswerLength: ans.textAnswer?.length,
            hasUploadedFile: !!ans.uploadedFile,
            uploadedFile: ans.uploadedFile,
            fullAnswer: ans
          });
        });
        setAttempt(response.data.attempt);
        setAssessment(response.data.attempt.assessmentId);
        setEvaluationDrafts(buildEvaluationDrafts(response.data.attempt));
      } else {
        console.error('API returned success: false', response.data);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || error.message || 'Failed to load answers');
    } finally {
      setLoading(false);
    }
  };

  const updateEvaluationDraft = (questionIndex, field, value, maxMarks) => {
    setEvaluationDrafts((prev) => ({
      ...prev,
      [questionIndex]: {
        awardedMarks: prev?.[questionIndex]?.awardedMarks ?? '',
        [field]: value
      }
    }));
    if (field === 'awardedMarks') {
      const num = parseInt(value, 10);
      setMarksErrors((prev) => ({
        ...prev,
        [questionIndex]: value !== '' && (isNaN(num) || num < 0 || num > maxMarks)
          ? `Maximum Marks should not be greater than ${maxMarks}`
          : ''
      }));
    }
  };

  const saveManualEvaluation = async () => {
    if (!attempt || !assessment) {
      return;
    }

    const hasMarksErrors = Object.values(marksErrors).some((err) => err);
    if (hasMarksErrors) {
      showError('Please fix the marks errors before saving.');
      return;
    }

    const manualAnswersToEvaluate = (attempt.answers || []).filter((answer) => {
      const question = assessment.questions?.[answer.questionIndex];
      return question && isManualQuestionType(question.type) && hasManualResponse(answer);
    });

    if (!manualAnswersToEvaluate.length) {
      showError('No manual evaluation is required for this attempt.');
      return;
    }

    const missingEvaluation = manualAnswersToEvaluate.find((answer) => {
      const draftMarks = evaluationDrafts?.[answer.questionIndex]?.awardedMarks;
      return draftMarks === '' || draftMarks === null || draftMarks === undefined;
    });

    if (missingEvaluation) {
      showError(`Enter marks for question - ${String(missingEvaluation.questionIndex + 1).padStart(2, '0')}.`);
      return;
    }

    const computedResult = (() => {
      const totalManualMarks = manualAnswersToEvaluate.reduce((sum, answer) => {
        const draft = evaluationDrafts?.[answer.questionIndex];
        return sum + (draft ? Number(draft.awardedMarks) || 0 : 0);
      }, 0);
      const objectiveScore = Number(attempt.score || 0) - (attempt.answers || []).reduce((sum, ans) => {
        const q = assessment.questions?.[ans.questionIndex];
        return sum + (q && isManualQuestionType(q.type) ? Number(ans.awardedMarks || 0) : 0);
      }, 0);
      const projectedScore = objectiveScore + totalManualMarks;
      const projectedPct = attempt.totalMarks > 0 ? (projectedScore / Number(attempt.totalMarks)) * 100 : 0;
      const passing = Number(assessment?.passingPercentage ?? 60);
      return projectedPct >= passing ? 'Pass' : 'Fail';
    })();

    showConfirmation(
      computedResult === 'Pass'
        ? (
          <span>
            Are you sure you want to mark this assessment as <span style={{ color: '#16a34a', fontWeight: '700' }}>Pass</span>? Once updated, this action cannot be edited, deleted
            <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontSize: '0.85rem' }}>
              <strong>Note:</strong> Once the assessment is marked as Pass, you must update the candidate status to{' '}
              <span
                onClick={() => {
                  const appId = attempt?.applicationId?._id || attempt?.applicationId;
                  if (appId) navigate(`/employer/emp-candidate-review/${appId}#manual-stage-tracking`, { state: { highlightAttemptId: attemptId } });
                }}
                style={{ color: '#15803d', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Shortlisted for Next Round
              </span>{' '}under Candidate Status.
            </div>
          </span>
        )
        : (<span>Are you sure you want to mark this assessment as <span style={{ color: '#dc2626', fontWeight: '700' }}>Fail</span>? Once updated, this action cannot be edited, deleted</span>),
      () => {
        if (computedResult === 'Pass') {
          const appId = attempt?.applicationId?._id || attempt?.applicationId;
          performSave(appId ? () => navigate(`/employer/emp-candidate-review/${appId}#manual-stage-tracking`, { state: { highlightAttemptId: attemptId } }) : null);
        } else {
          performSave();
        }
      },
      null,
      'warning',
      computedResult === 'Pass' ? { confirmText: 'Yes,Go to Status' } : {}
    );
  };

  const performSave = async (onSuccess = null) => {
    const manualAnswersToEvaluate = (attempt.answers || []).filter((answer) => {
      const question = assessment.questions?.[answer.questionIndex];
      return question && isManualQuestionType(question.type) && hasManualResponse(answer);
    });

    try {
      setSavingEvaluation(true);
      const token = localStorage.getItem('employerToken');
        const payload = {
          evaluations: manualAnswersToEvaluate.map((answer) => ({
            questionIndex: answer.questionIndex,
            awardedMarks: evaluationDrafts?.[answer.questionIndex]?.awardedMarks
          }))
        };

      const response = await axios.put(`${API_BASE_URL}/employer/assessment-attempts/${attemptId}/manual-evaluation`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success && response.data?.attempt) {
        setAttempt(response.data.attempt);
        setAssessment(response.data.attempt.assessmentId);
        setEvaluationDrafts(buildEvaluationDrafts(response.data.attempt));
        showSuccess('Manual evaluation saved successfully.');
        if (onSuccess) onSuccess();
        return;
      }

      showError(response.data?.message || 'Failed to save manual evaluation.');
    } catch (saveError) {
      console.error('Error saving manual evaluation:', saveError);
      showError(saveError.response?.data?.message || saveError.message || 'Failed to save manual evaluation.');
    } finally {
      setSavingEvaluation(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading answers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '1rem',
          color: '#dc2626'
        }}>
          <h3>Error Loading Answers</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!attempt || !assessment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No answers found</p>
      </div>
    );
  }

  const allAnswers = attempt.answers?.map(a => {
    const question = assessment.questions[a.questionIndex];
    return question ? a : null;
  }).filter(a => a !== null) || [];

  const manualAnswersToEvaluate = allAnswers.filter((answer) => {
    const question = assessment.questions?.[answer.questionIndex];
    return question && isManualQuestionType(question.type) && hasManualResponse(answer);
  });
  const manualEvaluationPendingCount = Number(attempt.manualEvaluationPendingCount || 0);
  const manualEvaluationCompletedCount = Number(attempt.manualEvaluationCompletedCount || 0);
  const passingPercentage = Number(assessment?.passingPercentage ?? 60);
  const passingMarks = Number.isFinite(passingPercentage)
    ? Math.round(((Number(attempt.totalMarks || 0) * passingPercentage) / 100) * 100) / 100
    : 0;
  const resultLabel = getResultLabel(attempt);
  const manualEvaluationSummary = manualAnswersToEvaluate.length > 0 && (
    <div style={{
      marginTop: '2rem',
      padding: '1rem',
      borderRadius: '8px',
      background: manualEvaluationPendingCount > 0 ? '#fff7ed' : '#ecfdf5',
      border: `1px solid ${manualEvaluationPendingCount > 0 ? '#fdba74' : '#86efac'}`,
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontWeight: '700', color: '#111827', marginBottom: '0.35rem' }}>Manual Evaluation</div>
        <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>
          {manualEvaluationPendingCount > 0
            ? `${manualEvaluationPendingCount} answer${manualEvaluationPendingCount === 1 ? '' : 's'} pending review`
            : `${manualEvaluationCompletedCount} answer${manualEvaluationCompletedCount === 1 ? '' : 's'} reviewed`}
        </div>
      </div>
      <button
        type="button"
        onClick={saveManualEvaluation}
        disabled={savingEvaluation}
        style={{
          background: savingEvaluation ? '#9ca3af' : '#f97316',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          fontWeight: '600',
          cursor: savingEvaluation ? 'not-allowed' : 'pointer'
        }}
      >
        {savingEvaluation ? 'Saving...' : 'Save Manual Evaluation'}
      </button>
    </div>
  );

  console.log('Total answers:', attempt.answers?.length);
  console.log('Displayed answers:', allAnswers.length);
  console.log('All answers data:', JSON.stringify(attempt.answers, null, 2));

  // Check if answers are empty submissions
  const hasEmptyAnswers = allAnswers.some(a => 
    a.selectedAnswer === null && 
    a.textAnswer === null && 
    !a.uploadedFile
  );

  return (
    <div className="twm-right-section-panel site-bg-gray view-answers-page" style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: '#f7f7f7', 
      padding: '0'
    }}>
      <button
        onClick={() => navigate(-1)}
        className="view-answers-page__back"
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          margin: '1rem 0 1rem 1rem',
          position: 'relative',
          zIndex: 1000
        }}
      >
        <i className="fa fa-arrow-left" style={{ fontSize: '1rem', color: '#ff6b35' }}></i>
        <span style={{ fontSize: '0.875rem', color: '#374151' }}>Back</span>
      </button>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 2rem 1rem' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
        }} className="view-answers-page__summary">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Assessment Answers
            </h2>
            <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              {attempt.candidateId?.name || 'N/A'} • {attempt.candidateId?.email || 'N/A'}
            </p>
          </div>
          <div className="view-answers-page__meta" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem', 
            padding: '1rem', 
            background: '#f9fafb', 
            borderRadius: '8px'
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Assessment</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.8rem' }}>{decodeAssessmentText(assessment.title)}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Passing Percentage</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{passingPercentage}%</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Obtained Percentage</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{Math.min(100, attempt.percentage ?? 0)}%</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Score</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{attempt.score}/{attempt.totalMarks}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Result</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{resultLabel}</div>
            </div>

          </div>
        </div>

        {allAnswers.length === 0 ? (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '3rem', 
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
          }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>No answers found</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Total answers: {attempt.answers?.length || 0}
            </p>
          </div>
        ) : (
          <div>
            {hasEmptyAnswers && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="fa fa-exclamation-triangle" style={{ color: '#f39c12' }}></i>
                <span style={{ color: '#856404' }}>
                  Some questions were submitted without answers. These appear as empty responses below.
                </span>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {allAnswers.map((answer, index) => {
              const question = assessment.questions[answer.questionIndex];
              const isObjectiveQuestion = isObjectiveQuestionType(question.type);
              const isManualQuestion = isManualQuestionType(question.type);
              const canEvaluateThisAnswer = isManualQuestion && hasManualResponse(answer);
              const evaluationDraft = evaluationDrafts?.[answer.questionIndex] || {
                awardedMarks: answer?.awardedMarks ?? ''
              };
              const isCorrect = isObjectiveQuestion && parseInt(answer.selectedAnswer) === parseInt(question.correctAnswer);
              return (
                  <div
                    className="view-answers-page__answer"
                    key={index}
                    style={{ 
                      background: 'white', 
                    borderRadius: '12px', 
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
                  }}
                >
                  <div className="view-answers-page__question-meta" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ 
                      background: '#ff6b35', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      Question {answer.questionIndex + 1}
                    </span>
                    <span style={{ 
                      background: (question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq' || question.type === 'image-mcq') ? '#3b82f6' : 
                                 question.type === 'subjective' ? '#10b981' : '#f59e0b', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {question.type === 'mcq' ? 'MCQ' : 
                       question.type === 'visual-mcq' ? 'Question with image' :
                       question.type === 'questionary-image-mcq' ? ' Options with image' :
                       question.type === 'image-mcq' ? 'Image MCQ' :
                       question.type === 'subjective' ? 'Subjective' : 'File/Image Upload'}
                    </span>
                    {(question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq' || question.type === 'image-mcq') && (
                      <span style={{ 
                        background: isCorrect ? '#dcfce7' : '#fecaca', 
                        color: isCorrect ? '#166534' : '#991b1b', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                  </div>
                  <style>{`
                    .va-question-content ol{padding-left:28px;margin-left:0;list-style-position:outside}
                    .va-question-content li{word-break:break-word;overflow-wrap:break-word;margin-bottom:6px}
                    .va-question-content pre,.va-question-content code{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:2px 6px;font-family:monospace;font-size:13px;color:#1e293b;white-space:pre-wrap;word-break:break-word}
                    .va-question-content pre{display:block;padding:10px 14px;margin:8px 0}
                    .va-question-content{overflow-x:hidden;font-size:1rem;font-weight:600;color:#111827;line-height:1.6;margin-bottom:1rem}
                  `}</style>
                  <div
                    className="va-question-content"
                    dangerouslySetInnerHTML={{ __html: formatAssessmentContent(question.question || (question.type === 'image-mcq' ? 'Image-based question' : 'Untitled Question')) }}
                  />
                  {question.imageUrl && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                      <img 
                        src={question.imageUrl} 
                        alt="Question illustration" 
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  )}
                  
                  {isObjectiveQuestion ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {question.options.map((option, idx) => {
                        const isSelected = parseInt(answer.selectedAnswer) === idx;
                        const isCorrectOption = parseInt(question.correctAnswer) === idx;
                        return (
                          <div 
                            key={idx}
                            style={{ 
                              background: isSelected ? (isCorrectOption ? '#dcfce7' : '#fecaca') : (isCorrectOption ? '#fef3c7' : '#f9fafb'),
                              padding: '1rem', 
                              borderRadius: '8px',
                              borderLeft: isSelected ? '4px solid ' + (isCorrectOption ? '#10b981' : '#ef4444') : (isCorrectOption ? '4px solid #f59e0b' : 'none'),
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem'
                            }}
                          >
                            <span style={{ fontWeight: '600', color: '#374151', marginTop: '2px' }}>{String.fromCharCode(65 + idx)}.</span>
                            <div style={{ flex: 1 }}>
                              {question.type !== 'questionary-image-mcq' && <span style={{ color: '#374151' }}>{decodeAssessmentText(option)}</span>}
                              {(question.type === 'visual-mcq' || question.type === 'questionary-image-mcq') && question.optionImages && question.optionImages[idx] && (
                                <div style={{ marginTop: '8px' }}>
                                  <img 
                                    src={question.optionImages[idx]} 
                                    alt={`Option ${String.fromCharCode(65 + idx)}`} 
                                    style={{
                                      maxWidth: '200px', 
                                      maxHeight: '150px', 
                                      borderRadius: '4px', 
                                      border: '1px solid #e5e7eb',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }} 
                                  />
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              {isSelected && <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Selected</span>}
                              {isCorrectOption && !isSelected && <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b' }}>Correct Answer</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      background: '#f9fafb', 
                      padding: '1.5rem', 
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        question.type === 'image' ? '#8b5cf6' : 
                        question.type === 'upload' ? '#f59e0b' : '#10b981'
                      }`
                    }}>
                      {answer.textAnswer ? (
                        <div>
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '0.875rem', 
                            fontWeight: '600',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Candidate's Answer:
                          </div>
                          <p style={{ 
                            color: '#374151', 
                            fontSize: '1rem', 
                            lineHeight: '1.75',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {answer.textAnswer}
                          </p>
                        </div>
                      ) : answer.uploadedFile ? (
                        <div style={{ color: '#374151' }}>
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '0.875rem', 
                            fontWeight: '600',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Uploaded {question.type === 'image' ? 'Image' : 'File'}:
                          </div>
                          
                          {question.type === 'image' ? (
                            <div style={{ marginTop: '1rem' }}>
                              <img 
                                src={resolveFileUrl(answer.uploadedFile.path)} 
                                alt="Candidate's upload" 
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '500px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                onLoad={(e) => {
                                  e.target.nextSibling.style.display = 'none';
                                }}
                                onError={(e) => {
                                  console.error('Image failed to load:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div style={{ display: 'none', padding: '2rem', textAlign: 'center', background: '#fef2f2', borderRadius: '8px', border: '2px dashed #fca5a5' }}>
                                <i className="fa fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}></i>
                                <p style={{ color: '#dc2626', margin: 0, fontWeight: '600' }}>Image Upload Failed</p>
                                <p style={{ color: '#7f1d1d', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>The uploaded image could not be found on the server.</p>
                                <p style={{ color: '#991b1b', fontSize: '0.75rem', margin: '0.5rem 0 0 0', fontFamily: 'monospace' }}>{answer.uploadedFile.path}</p>
                              </div>
                              <div style={{ marginTop: '0.5rem' }}>
                                <a 
                                  href={resolveFileUrl(answer.uploadedFile.path)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'underline' }}
                                >
                                  View Full Size Image
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="view-answers-page__file" style={{ 
                               display: 'flex', 
                               alignItems: 'center', 
                               gap: '1rem',
                              background: 'white',
                              padding: '1rem',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <i className="fa fa-file-text" style={{ fontSize: '2rem', color: '#f59e0b' }}></i>
                              <div>
                                <div style={{ fontWeight: '600', color: '#374151' }}>{answer.uploadedFile.originalName || 'Uploaded file'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  {(answer.uploadedFile.size / 1024).toFixed(1)} KB • {new Date(answer.uploadedFile.uploadedAt).toLocaleString('en-IN', {
                                    timeZone: 'Asia/Kolkata'
                                  })}
                                </div>
                                <a 
                                  href={resolveFileUrl(answer.uploadedFile.path)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    display: 'inline-block',
                                    marginTop: '0.5rem',
                                    color: '#3b82f6', 
                                    fontWeight: '600',
                                    textDecoration: 'none' 
                                  }}
                                >
                                  <i className="fa fa-download" style={{ marginRight: '0.4rem' }}></i>
                                  Download File
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ 
                          background: '#f9fafb', 
                          padding: '1.5rem', 
                          borderRadius: '8px',
                          borderLeft: `4px solid ${
                            question.type === 'image' ? '#8b5cf6' : 
                            question.type === 'upload' ? '#f59e0b' : '#10b981'
                          }`
                        }}>
                          {answer.textAnswer && answer.textAnswer.trim() ? (
                            <div>
                              <div style={{ 
                                color: '#6b7280', 
                                fontSize: '0.875rem', 
                                fontWeight: '600',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                Candidate's Answer:
                              </div>
                              <p style={{ 
                                color: '#374151', 
                                fontSize: '1rem', 
                                lineHeight: '1.75',
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}>
                                {answer.textAnswer}
                              </p>
                            </div>
                          ) : answer.uploadedFile ? (
                            <div style={{ color: '#374151' }}>
                              <div style={{ 
                                color: '#6b7280', 
                                fontSize: '0.875rem', 
                                fontWeight: '600',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                Uploaded {question.type === 'image' ? 'Image' : 'File'}:
                              </div>
                              
                              {question.type === 'image' ? (
                                <div style={{ marginTop: '1rem' }}>
                                  <img 
                                    src={answer.uploadedFile.data || resolveFileUrl(answer.uploadedFile.path)} 
                                    alt="Candidate's upload" 
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: '500px',
                                      borderRadius: '8px',
                                      border: '1px solid #e5e7eb',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '1rem',
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb'
                                }}>
                                  <i className="fa fa-file-text" style={{ fontSize: '2rem', color: '#f59e0b' }}></i>
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#374151' }}>{answer.uploadedFile.originalName || 'Uploaded file'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                      {answer.uploadedFile.size ? `${(answer.uploadedFile.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                    </div>
                                    {answer.uploadedFile.data && (
                                      <a 
                                        href={answer.uploadedFile.data} 
                                        download={answer.uploadedFile.originalName || 'file'}
                                        style={{ 
                                          display: 'inline-block',
                                          marginTop: '0.5rem',
                                          color: '#3b82f6', 
                                          fontWeight: '600',
                                          textDecoration: 'none',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <i className="fa fa-download" style={{ marginRight: '0.4rem' }}></i>
                                        Download File
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div style={{ 
                                color: '#6b7280', 
                                fontSize: '0.875rem', 
                                fontWeight: '600',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                              }}>
                                Expected: {question.type === 'image' ? 'Image Upload' : question.type === 'upload' ? 'File Upload' : 'Text Answer'}
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                background: '#fef2f2',
                                borderRadius: '6px',
                                border: '1px solid #fecaca'
                              }}>
                                <i className="fa fa-exclamation-circle" style={{ color: '#ef4444', fontSize: '1.25rem' }}></i>
                                <div>
                                  <p style={{ 
                                    color: '#dc2626', 
                                    fontSize: '0.875rem', 
                                    fontWeight: '600',
                                    margin: '0 0 0.25rem 0'
                                  }}>
                                    No {question.type === 'image' ? 'image' : question.type === 'upload' ? 'file' : 'answer'} submitted
                                  </p>
                                  <p style={{ 
                                    color: '#7f1d1d', 
                                    fontSize: '0.75rem',
                                    margin: 0
                                  }}>
                                    The candidate submitted this question but did not provide any {question.type === 'image' ? 'image' : question.type === 'upload' ? 'file' : 'text answer'}.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {isManualQuestion && (
                    <div style={{
                      marginTop: '1.25rem',
                      padding: '1rem',
                      borderRadius: '10px',
                      background: canEvaluateThisAnswer ? '#f8fafc' : '#f9fafb',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ fontWeight: '700', color: '#111827' }}>Employer Evaluation</div>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: answer.evaluationStatus === 'evaluated' ? '#dcfce7' : canEvaluateThisAnswer ? '#ffedd5' : '#f3f4f6',
                          color: answer.evaluationStatus === 'evaluated' ? '#166534' : canEvaluateThisAnswer ? '#9a3412' : '#6b7280'
                        }}>
                          {answer.evaluationStatus === 'evaluated'
                            ? 'Reviewed'
                            : canEvaluateThisAnswer
                              ? 'Pending Review'
                              : 'No Response'}
                        </span>
                      </div>

                      {canEvaluateThisAnswer ? (
                        <>
                          <div style={{
                            maxWidth: '180px'
                          }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#111827', marginBottom: '0.4rem' }}>
                                Enter marks for question
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={question.marks || 1}
                                step="1"
                                value={evaluationDraft.awardedMarks}
                                onChange={(e) => updateEvaluationDraft(answer.questionIndex, 'awardedMarks', e.target.value, question.marks || 1)}
                                style={{
                                  width: '100%',
                                  border: `1px solid ${marksErrors[answer.questionIndex] ? '#ef4444' : '#d1d5db'}`,
                                  borderRadius: '8px',
                                  padding: '0.7rem 0.85rem',
                                  fontSize: '0.95rem'
                                }}
                              />
                              {marksErrors[answer.questionIndex] && (
                                <div style={{ marginTop: '0.25rem', color: '#ef4444', fontSize: '0.75rem' }}>
                                  {marksErrors[answer.questionIndex]}
                                </div>
                              )}
                              <div style={{ marginTop: '0.35rem', color: '#6b7280', fontSize: '0.75rem' }}>
                                Max: {question.marks || 1}
                              </div>
                            </div>
                          </div>

                          {answer.evaluationStatus === 'evaluated' && (
                            <div style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.8rem' }}>
                              Saved marks: {answer.awardedMarks ?? 0}/{question.marks || 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          Manual evaluation is not required because the candidate did not submit a response for this question.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="view-answers-page__status-row" style={{ 
                    marginTop: '1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <span><strong style={{ color: '#111827' }}>Marks:</strong> {question.marks || 1}</span>
                    {isManualQuestion && <span><strong style={{ color: '#111827' }}>Enter marks for question - {String(answer.questionIndex + 1).padStart(2, '0')}:</strong> {answer.awardedMarks ?? 0}</span>}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {manualEvaluationSummary}
      </div>
    </div>
  );
}
