import { useEffect, useState } from "react";
import { api } from "../../../../../utils/api";
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function SectionCanAttachment({ profile }) {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (profile?.resumeFileName) {
            setResumeFile(profile.resumeFileName);
        } else {
            setResumeFile(null);
        }
    }, [profile?.resumeFileName]);

    const handleFileSelect = (e) => {
        // Prevent file selection if resume already exists
        if (resumeFile) {
            showWarning('Please delete your current resume before uploading a new one.');
            e.target.value = ''; // Clear the input
            return;
        }

        const file = e.target.files[0];
        if (file) {
            // Check file size (10MB limit - accounting for Base64 encoding overhead)
            // Base64 encoding increases size by ~33%, so 10MB becomes ~13.3MB after encoding
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                showError('File size must be less than 10MB. Please choose a smaller file.');
                e.target.value = ''; // Clear the input
                setSelectedFile(null); // Ensure no file is selected
                return;
            }
            
            // Check file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                showPopup('Only PDF, DOC, and DOCX files are allowed.', 'error', 4000);
                e.target.value = ''; // Clear the input
                setSelectedFile(null); // Ensure no file is selected
                return;
            }
        }
        setSelectedFile(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            showWarning('Please select a file first');
            return;
        }

        // Double-check file size before upload
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
            showError('File size must be less than 10MB. Please choose a smaller file.');
            setSelectedFile(null);
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', selectedFile);

        try {
            const response = await api.uploadResume(formData);
            if (response.success) {
                showSuccess('Resume uploaded successfully!');
                setResumeFile(selectedFile.name);
                setSelectedFile(null);
                // Clear the file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showError(`Failed to upload resume: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Resume upload error:', error);
            let errorMessage = 'Failed to upload resume';
            
            // Check if error response is HTML (server error page)
            if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<html')) {
                errorMessage = 'File size exceeds server limit. Please upload a file smaller than 10MB.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 413) {
                errorMessage = 'File size exceeds the limit. Please upload a file smaller than 10MB.';
            } else if (error.response?.status === 408) {
                errorMessage = 'Upload timeout. Please try a smaller file or check your internet connection.';
            } else if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            
            showError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const showConfirmationToast = () => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background-color: white;
            color: #333;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #ddd;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            pointer-events: auto;
        `;

        if (window.innerWidth <= 576) {
            container.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                max-width: 400px;
                width: 90%;
                pointer-events: none;
            `;
        }

        toast.innerHTML = `
            <div style="margin-bottom: 15px; font-weight: 600;">Are you sure you want to delete your resume?</div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="confirm-yes" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                ">Yes</button>
                <button id="confirm-no" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                ">No</button>
            </div>
        `;

        container.appendChild(toast);

        const yesBtn = toast.querySelector('#confirm-yes');
        const noBtn = toast.querySelector('#confirm-no');

        const removeToast = () => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                toast.remove();
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        };

        yesBtn.onclick = () => {
            removeToast();
            performDelete();
        };

        noBtn.onclick = () => {
            removeToast();
        };
    };

    const performDelete = async () => {
        setDeleting(true);
        try {
            const response = await api.deleteResume();
            if (response.success) {
                showSuccess('Resume deleted successfully!');
                setResumeFile(null);
                setSelectedFile(null);
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                showError(`Failed to delete resume: ${response.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Resume delete error:', error);
            let errorMessage = 'Failed to delete resume';
            if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            showError(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    const handleDelete = () => {
        if (!resumeFile) {
            showWarning('No resume to delete');
            return;
        }
        showConfirmationToast();
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">
                    <i className="fa fa-paperclip site-text-primary me-2"></i>
                    Attach Resume
                </h4>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <p>Resume is the most important document recruiters look for. Recruiters generally do not look at profiles without resumes.</p>
                    <div className="dashboard-cover-pic">
                        <div className="mb-3">
                            <label className="form-label">
                                <i className="fa fa-file-text me-1"></i>
                                Choose Resume File
                            </label>
                            <input 
                                type="file" 
                                accept=".pdf,.doc,.docx" 
                                onChange={handleFileSelect}
                                disabled={uploading || deleting || resumeFile}
                                className="form-control"
                            />
                        </div>
                        {selectedFile && (
                            <p className="text-info">
                                <i className="fa fa-file me-1"></i>
                                Selected: {selectedFile.name}
                            </p>
                        )}
                        <div className="d-flex gap-2 mb-3">
                            <button 
                                type="button" 
                                className="btn btn-outline-primary"
                                onClick={handleSubmit}
                                disabled={uploading || !selectedFile || deleting}
                                style={{backgroundColor: 'transparent'}}
                            >
                                <i className="fa fa-upload me-1"></i>
                                {uploading ? 'Uploading...' : 'Submit Resume'}
                            </button>
                            {resumeFile && (
                                <button 
                                    type="button" 
                                    className="btn btn-outline-danger"
                                    onClick={handleDelete}
                                    disabled={deleting || uploading}
                                    style={{backgroundColor: 'transparent'}}
                                >
                                    <i className="fa fa-trash me-1"></i>
                                    {deleting ? 'Deleting...' : 'Delete Resume'}
                                </button>
                            )}
                        </div>
                        {resumeFile && (
                            <div className="alert alert-success d-flex justify-content-between align-items-center" style={{padding: '8px 12px'}}>
                                <span>
                                    <i className="fa fa-check-circle me-1"></i>
                                    Current resume: <span style={{fontWeight: 'bold'}}>{resumeFile}</span>
                                </span>
                            </div>
                        )}
                        <div className="text-muted small">
                            <p className="mb-1">
                                <i className="fa fa-info-circle me-1"></i>
                                Upload Resume File size max 10 MB (PDF, DOC, DOCX only)
                            </p>
                            {resumeFile && (
                                <p className="mb-0 text-warning">
                                    <i className></i>
                                    To update your resume, first delete the current one, then upload a new file.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SectionCanAttachment;
