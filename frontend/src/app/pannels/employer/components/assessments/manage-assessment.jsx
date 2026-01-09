import React, { useState } from 'react';
import { usePopupNotification } from '../../../../../hooks/usePopupNotification';
import PopupNotification from '../../../../../components/PopupNotification';
import ConfirmationDialog from '../../../../../components/ConfirmationDialog';

function ManageAssessmentPage() {
    const [assessments, setAssessments] = useState([
        {
            _id: '1',
            title: 'JavaScript Fundamentals',
            description: 'Basic JS skills evaluation for frontend developers.',
            timeLimit: 30,
            questions: [
                { marks: 5 },
                { marks: 5 },
            ],
            createdAt: new Date().toISOString(),
        },
        {
            _id: '2',
            title: 'React Assessment',
            description: 'Test your React knowledge and JSX understanding.',
            timeLimit: 45,
            questions: [
                { marks: 10 },
                { marks: 5 },
                { marks: 5 },
            ],
            createdAt: new Date().toISOString(),
        },
    ]);

    const [applicantCount] = useState(42); // dummy count
    const [searchFilter, setSearchFilter] = useState('');
    const { popup, confirmation, showConfirmation, hideConfirmation, hidePopup, showSuccess } = usePopupNotification();

    const filteredAssessments = assessments.filter(assessment => 
        assessment.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const handleDeleteClick = (id, title) => {
        showConfirmation(
            `Are you sure you want to delete this assessment "${title}"?`,
            () => handleDeleteConfirm(id),
            hideConfirmation,
            'warning'
        );
    };

    const handleDeleteConfirm = (id) => {
        const updated = assessments.filter((item) => item._id !== id);
        setAssessments(updated);
        hideConfirmation();
        showSuccess('Assessment deleted successfully!');
    };

    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Manage Assessments</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dashboard</a><span>Assessment List</span></div>
            </div>

            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="panel-tittle m-a0"><i className="fa fa-list" /> Assessment Overview</h4>
                        <div className="d-flex align-items-center gap-3">
                            <select 
                                className="form-select" 
                                value={searchFilter} 
                                onChange={(e) => setSearchFilter(e.target.value)}
                                style={{ minWidth: '200px' }}
                            >
                                <option value="">Search Assessments...</option>
                                <option value="JavaScript">JavaScript</option>
                                <option value="React">React</option>
                                <option value="Python">Python</option>
                                <option value="Java">Java</option>
                                <option value="Node.js">Node.js</option>
                                <option value="Angular">Angular</option>
                                <option value="Vue.js">Vue.js</option>
                                <option value="PHP">PHP</option>
                                <option value="C++">C++</option>
                                <option value="SQL">SQL</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="panel-body wt-panel-body p-a20 m-b30">
                    {filteredAssessments.length === 0 ? (
                        <div className="text-center p-a20 bg-light">
                            <i className="fa fa-file-alt text-muted fa-2x m-b10" />
                            <h5>{searchFilter ? 'No assessments found' : 'No assessments created'}</h5>
                            <p className="text-muted">{searchFilter ? 'Try a different search term.' : 'Create your first assessment to get started.'}</p>
                        </div>
                    ) : (
                        <div className="row">
                            {filteredAssessments.map((assessment) => (
                                <div className="col-md-6" key={assessment._id}>
                                    <div className="job-post-company style-1 bg-white border p-a20 m-b20 rounded shadow-sm">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="text-primary">{assessment.title}</h5>
                                                <p className="text-muted small">{assessment.description}</p>
                                                <p className="text-muted"><i className="fa fa-clock text-warning m-r10" />Duration: {assessment.timeLimit} mins</p>
                                            </div>
                                            <button className="btn btn-link text-danger p-0" onClick={() => handleDeleteClick(assessment._id, assessment.title)}>
                                                <i className="fa fa-trash-alt" title="Delete" />
                                            </button>
                                        </div>

                                        <div className="d-flex flex-wrap m-t10">
                                            <div className="m-r20 text-muted">
                                                <i className="fa fa-question-circle text-success m-r5" />
                                                {assessment.questions.length} Questions
                                            </div>
                                            <div className="m-r20 text-muted">
                                                <i className="fa fa-users text-purple m-r5" />
                                                {applicantCount} Applicants
                                            </div>
                                            <div className="m-r20 text-muted">
                                                <i className="fa fa-check-circle text-info m-r5" />
                                                Total Marks: {assessment.questions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                                            </div>
                                            <div className="text-muted">
                                                <i className="fa fa-calendar-alt text-dark m-r5" />
                                                Created: {new Date(assessment.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Popup Notifications */}
            {popup.show && (
                <PopupNotification
                    message={popup.message}
                    type={popup.type}
                    onClose={hidePopup}
                />
            )}
            
            {/* Confirmation Dialog */}
            {confirmation.show && (
                <ConfirmationDialog
                    message={confirmation.message}
                    type={confirmation.type}
                    onConfirm={confirmation.onConfirm}
                    onCancel={confirmation.onCancel}
                />
            )}
        </>
    );
}

export default ManageAssessmentPage;
