import { useState, useEffect, useRef } from "react";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function SectionCanResumeHeadline({ profile }) {
    const [headline, setHeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef(null);

    useEffect(() => {
        setHeadline(profile?.resumeHeadline || '');
    }, [profile]);

    useEffect(() => {
        if (headline && headline !== profile?.resumeHeadline) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                handleSave();
            }, 1000);
        }
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [headline]);

    const handleSave = async () => {
        if (!headline.trim()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('candidateToken');
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            
            const response = await fetch(`${baseUrl}/api/candidate/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resumeHeadline: headline.trim() })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            console.error('Autosave failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">
                    Resume Headline <span style={{color: 'red'}}>*</span>
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-md-12">
                                <label><i className="fa fa-newspaper-o me-1"></i> Resume Headline</label>
                                <textarea 
                                    className="form-control" 
                                    placeholder="A resume headline is a brief summary of your profile that highlights your skills, experience, qualifications, and career objectives." 
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    rows={3}
                                    maxLength={200}
                                    required
                                />
                                <small className="text-muted">
                                    {headline.length}/200 characters
                                    {loading && <span className="ms-2 text-info"><i className="fa fa-spinner fa-spin"></i> Saving...</span>}
                                </small>
                            </div>
                        </div>


                    </div>
                </div>
            </form>
        </>
    )
}
export default SectionCanResumeHeadline;

