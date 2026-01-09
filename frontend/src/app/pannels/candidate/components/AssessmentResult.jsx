import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export default function AssessmentResult({ result }) {
  const { score, totalMarks, percentage, correctAnswers, totalQuestions } = result;

  const pieData = [
    { name: 'Correct', value: correctAnswers, color: '#10b981' },
    { name: 'Incorrect', value: totalQuestions - correctAnswers, color: '#ef4444' }
  ];

  return (
    <div className="mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h3 className="mb-0">Assessment Completed!</h3>
        </div>
        <div className="card-body">
          <div className="text-center mb-4">
            <div className="display-1 fw-bold" style={{color: percentage >= 60 ? '#10b981' : '#ef4444'}}>
              {percentage}%
            </div>
            <p className="text-muted">Score: {score}/{totalMarks}</p>
          </div>

          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3">Performance Breakdown</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="col-md-6">
              <h5 className="mb-3">Summary</h5>
              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between">
                  <span>Total Questions:</span>
                  <strong>{totalQuestions}</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Correct Answers:</span>
                  <strong className="text-success">{correctAnswers}</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Incorrect Answers:</span>
                  <strong className="text-danger">{totalQuestions - correctAnswers}</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Score:</span>
                  <strong>{score}/{totalMarks}</strong>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Result:</span>
                  <strong className={percentage >= 60 ? 'text-success' : 'text-danger'}>
                    {percentage >= 60 ? 'PASSED' : 'FAILED'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer text-center">
          <button className="btn btn-primary me-2" onClick={() => window.location.href = '/candidate/dashboard'}>
            <i className="fa fa-home me-2"></i>Back to Dashboard
          </button>
          <button className="btn btn-outline-primary" onClick={() => window.print()}>
            <i className="fa fa-download me-2"></i>Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
