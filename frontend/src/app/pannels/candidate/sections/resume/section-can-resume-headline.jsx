import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function SectionCanResumeHeadline({ profile }) {
    const [headline, setHeadline] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setHeadline(profile?.resumeHeadline || '');
    }, [profile]);

    const handleSave = async () => {
        if (!headline.trim()) {
            showError('Resume headline cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('candidateToken');
            
            const response = await fetch('http://localhost:5000/api/candidate/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resumeHeadline: headline.trim() })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showSuccess('Resume headline updated successfully!');
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showError('Failed to update resume headline: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            showError('Failed to update resume headline: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">
                    Resume Headline
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-md-12">
                                <label><i className="fa fa-newspaper-o me-1"></i> Resume Headline *</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="e.g., Experienced Software Developer with 3+ years in React and Node.js" 
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    rows={3}
                                    maxLength={200}
                                    required
                                />
                                <small className="text-muted">{headline.length}/200 characters</small>
                            </div>
                        </div>

                        <div className="text-left mt-4">
                            <button 
                                type="button" 
                                onClick={handleSave} 
                                className="btn btn-outline-primary" 
                                disabled={loading}
                                style={{backgroundColor: 'transparent'}}
                            >
                                <i className="fa fa-save me-1"></i>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
export default SectionCanResumeHeadline;

