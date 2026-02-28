import { useState, useEffect, useRef } from "react";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function SectionCanProfileSummary({ profile }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const debounceTimer = useRef(null);

    useEffect(() => {
        setSummary(profile?.profileSummary || '');
    }, [profile]);

    useEffect(() => {
        if (summary && summary !== profile?.profileSummary) {
            const trimmed = summary.trim();
            if (trimmed.length > 0 && trimmed.length < 50) {
                setError('Profile summary should be at least 50 characters long');
            } else {
                setError('');
            }
            
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                handleSave();
            }, 1000);
        }
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [summary]);

    const handleSave = async () => {
        const trimmedSummary = summary.trim();
        if (!trimmedSummary || trimmedSummary.length < 50) return;

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
                body: JSON.stringify({ profileSummary: trimmedSummary })
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
            <div className="panel-heading wt-panel-heading p-a20">
                <h4 className="panel-tittle m-a0">
                    Profile Summary
                </h4>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                <div className="alert alert-info mb-3">
                    <i className="fa fa-info-circle me-2"></i>
                    Mention highlights of your career, education, and professional interests.
                </div>
                <textarea 
                    className={`form-control mb-2 ${error ? 'is-invalid' : ''}`}
                    placeholder="e.g., Passionate software developer with 2+ years of experience in full-stack development. Skilled in React, Node.js, and database management."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={5}
                    maxLength={1000}
                />
                {error && <div className="text-danger small mb-2">{error}</div>}
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        {summary.length}/1000 characters
                        {loading && <span className="ms-2 text-info"><i className="fa fa-spinner fa-spin"></i> Saving...</span>}
                    </small>
                </div>
            </div>
        </>
    )
}
export default SectionCanProfileSummary;
