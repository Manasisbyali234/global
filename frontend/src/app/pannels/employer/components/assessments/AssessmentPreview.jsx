import React, { useState } from "react";
import { FaClock } from "react-icons/fa";

const AssessmentPreview = ({ assessment, onBack }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);

    if (!assessment) return null;

    const questions = assessment.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    const handleOptionChange = (idx) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = idx;
        setAnswers(newAnswers);
    };

    const handleTextAnswerChange = (value) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = value;
        setAnswers(newAnswers);
    };

    return (
        <div style={{
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f5f6fa",
            height: "100%",
            overflowY: "auto",
            borderRadius: "12px"
        }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* Header for Preview */}
                <div style={{ 
                    marginBottom: '20px',
                    padding: '10px 0',
                    borderBottom: '1px solid #ddd'
                }}>
                    <h4 style={{ margin: 0 }}>Candidate View Preview</h4>
                </div>

                {/* Title Bar */}
                <div style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    marginBottom: "15px",
                }}>
                    <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "bold" }}>
                        {assessment.title || "Assessment Title"}
                    </h2>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                        alignItems: "center",
                    }}>
                        <div style={{ fontSize: "14px", color: "#555" }}>
                            Progress: {questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0}% complete
                        </div>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            fontWeight: "bold",
                            color: "#e74c3c",
                        }}>
                            <FaClock style={{ marginRight: "5px" }} />
                            {assessment.timer || 0}:00
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div style={{
                        height: "6px",
                        background: "#e0e0e0",
                        borderRadius: "3px",
                        marginTop: "10px",
                    }}>
                        <div style={{
                            width: `${questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0}%`,
                            height: "100%",
                            background: "#2c3e50",
                            borderRadius: "3px",
                        }}></div>
                    </div>
                </div>

                {/* Question Card */}
                {questions.length > 0 ? (
                    <div style={{
                        background: "#fff",
                        padding: "20px",
                        borderRadius: "8px",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}>
                        <div style={{
                            marginBottom: "15px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            lineHeight: "1.5"
                        }}>
                            <span style={{ marginRight: "10px" }}>{currentQuestionIndex + 1}.</span>
                            <div 
                                style={{ display: "inline-block", verticalAlign: "top", width: "calc(100% - 40px)" }}
                                dangerouslySetInnerHTML={{ __html: currentQuestion.question || (currentQuestion.type === 'image-mcq' ? "Image-based question" : "Untitled Question") }} 
                            />
                        </div>
                        
                        {currentQuestion.imageUrl && (
                            <div style={{ marginBottom: "15px", textAlign: "center" }}>
                                <img 
                                    src={currentQuestion.imageUrl} 
                                    alt="Question illustration" 
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        borderRadius: "8px",
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {currentQuestion.type === 'subjective' ? (
                                <textarea
                                    style={{
                                        width: "100%",
                                        minHeight: "150px",
                                        padding: "12px",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                        fontSize: "14px"
                                    }}
                                    placeholder="Type your answer here..."
                                    value={answers[currentQuestionIndex] || ''}
                                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                                />
                            ) : currentQuestion.options && currentQuestion.options.length > 0 ? (
                                currentQuestion.options.map((option, idx) => (
                                    <label
                                        key={idx}
                                        style={{
                                            border: answers[currentQuestionIndex] === idx ? "2px solid #3498db" : "1px solid #ccc",
                                            borderRadius: "5px",
                                            padding: "10px",
                                            marginBottom: "8px",
                                            cursor: "pointer",
                                            backgroundColor: answers[currentQuestionIndex] === idx ? "#ecf6fd" : "#fff",
                                            display: "flex",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${currentQuestionIndex}`}
                                            checked={answers[currentQuestionIndex] === idx}
                                            onChange={() => handleOptionChange(idx)}
                                            style={{ marginRight: "10px", marginTop: "2px" }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div>{String.fromCharCode(65 + idx)}.{currentQuestion.type !== 'questionary-image-mcq' && ` ${option}`}</div>
                                            {(currentQuestion.type === 'visual-mcq' || currentQuestion.type === 'questionary-image-mcq') && currentQuestion.optionImages && currentQuestion.optionImages[idx] && (
                                                <div style={{ marginTop: "8px" }}>
                                                    <img 
                                                        src={currentQuestion.optionImages[idx]} 
                                                        alt={`Option ${String.fromCharCode(65 + idx)}`} 
                                                        style={{
                                                            maxWidth: "150px", 
                                                            maxHeight: "100px", 
                                                            borderRadius: "4px"
                                                        }} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p className="text-muted">No options available for this question type in preview.</p>
                            )}
                        </div>

                        {/* Navigation */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "20px",
                            alignItems: "center",
                        }}>
                            <button
                                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                disabled={currentQuestionIndex === 0}
                                className="btn btn-outline-secondary"
                            >
                                ← Previous
                            </button>

                            <div style={{ display: "flex", gap: "5px" }}>
                                {questions.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "4px",
                                            border: idx === currentQuestionIndex ? "none" : "1px solid #ccc",
                                            background: idx === currentQuestionIndex ? "#3498db" : "#fff",
                                            color: idx === currentQuestionIndex ? "#fff" : "#000",
                                        }}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className="btn btn-primary"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <p>No questions added yet. Add questions to see a preview.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentPreview;
