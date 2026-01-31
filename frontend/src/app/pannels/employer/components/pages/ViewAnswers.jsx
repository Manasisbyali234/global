import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ViewAnswers() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnswers();
  }, [attemptId]);

  const fetchAnswers = async () => {
    try {
      const token = localStorage.getItem('employerToken');
      console.log('Fetching answers for attemptId:', attemptId);
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await axios.get(`http://localhost:5000/api/employer/assessment-attempts/${attemptId}`, {
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
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: '#f7f7f7', 
      padding: '0'
    }}>
      <button
        onClick={() => navigate(-1)}
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
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Assessment Answers
            </h2>
            <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              {attempt.candidateId?.name || 'N/A'} • {attempt.candidateId?.email || 'N/A'}
            </p>
          </div>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem', 
            padding: '1rem', 
            background: '#f9fafb', 
            borderRadius: '8px'
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Assessment</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.8rem' }}>{assessment.title}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Score</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{attempt.score}/{attempt.totalMarks}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Percentage</div>
              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{attempt.percentage}%</div>
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
              const isCorrect = (question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq') && parseInt(answer.selectedAnswer) === parseInt(question.correctAnswer);
              return (
                <div 
                  key={index}
                  style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
                  }}
                >
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                      background: (question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq') ? '#3b82f6' : 
                                 question.type === 'subjective' ? '#10b981' : 
                                 question.type === 'image' ? '#8b5cf6' : '#f59e0b', 
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {question.type === 'mcq' ? 'MCQ' : 
                       question.type === 'visual-mcq' ? 'Visual MCQ' :
                       question.type === 'questionary-image-mcq' ? 'Questionary image MCQ' :
                       question.type === 'subjective' ? 'Subjective' : 
                       question.type === 'image' ? 'Image Upload' : 'File Upload'}
                    </span>
                    {(question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq') && (
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
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: '1rem' 
                  }}>
                    {question.question.replace(/<[^>]*>/g, '')}
                  </h3>
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
                  
                  {(question.type === 'mcq' || question.type === 'visual-mcq' || question.type === 'questionary-image-mcq') ? (
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
                              {question.type !== 'questionary-image-mcq' && <span style={{ color: '#374151' }}>{option}</span>}
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
                                src={answer.uploadedFile.path.startsWith('http') ? answer.uploadedFile.path : `http://localhost:5000${answer.uploadedFile.path}`} 
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
                                  href={answer.uploadedFile.path.startsWith('http') ? answer.uploadedFile.path : `http://localhost:5000${answer.uploadedFile.path}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'underline' }}
                                >
                                  View Full Size Image
                                </a>
                              </div>
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
                                  {(answer.uploadedFile.size / 1024).toFixed(1)} KB • {new Date(answer.uploadedFile.uploadedAt).toLocaleString()}
                                </div>
                                <a 
                                  href={answer.uploadedFile.path.startsWith('http') ? answer.uploadedFile.path : `http://localhost:5000${answer.uploadedFile.path}`} 
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
                                    src={answer.uploadedFile.data || (answer.uploadedFile.path?.startsWith('http') ? answer.uploadedFile.path : `http://localhost:5000${answer.uploadedFile.path}`)} 
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
                  
                  <div style={{ 
                    marginTop: '1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <span>Marks: {question.marks || 1}</span>
                    <span>Answered at: {new Date(answer.answeredAt).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
