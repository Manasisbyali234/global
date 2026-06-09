import React, { useState, useEffect, useRef } from 'react';
import { formatDate, formatDateTime } from '../../../../utils/dateFormatter';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import './admin-support-tickets.css';
import './admin-emp-manage-styles.css';
import { showPopup, showSuccess, showError, showWarning, showInfo, showConfirmation } from '../../../../utils/popupNotification';
import PageLoader from '../../../../components/PageLoader';
import { formatJobTitle } from '../../../../utils/jobTitleFormatter';
function AdminSupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isTicketModalMinimized, setIsTicketModalMinimized] = useState(false);
    const [isTicketModalMaximized, setIsTicketModalMaximized] = useState(false);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [universitySearch, setUniversitySearch] = useState('');
    const [companySearch, setCompanySearch] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        userType: '',
        priority: '',
        category: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        new: 0,
        inProgress: 0,
        resolved: 0
    });
    const [updating, setUpdating] = useState(false);
    const [attachmentPreview, setAttachmentPreview] = useState({
        open: false,
        url: '',
        name: '',
        type: ''
    });
    const responseTextareaRef = useRef(null);

    const resizeResponseTextarea = (textareaElement = responseTextareaRef.current) => {
        if (!textareaElement) return;

        textareaElement.style.height = '0px';
        textareaElement.style.height = `${textareaElement.scrollHeight}px`;
    };

    const getResponseTargetLabel = (userType) => {
        if (userType === 'employer') return 'employer';
        if (userType === 'candidate') return 'candidate';
        if (userType === 'placement') return 'Placement Dean';
        return 'guest user';
    };

    const getResponsePlaceholder = (userType) => {
        if (userType === 'employer') {
            return 'Write a clear response for this employer ticket. This message will be shared with the employer.';
        }
        if (userType === 'candidate') {
            return 'Write a clear response for this candidate ticket. This message will be shared with the candidate.';
        }
        if (userType === 'placement') {
            return 'Write a clear response for this placement ticket. This message will be shared with the Placement Dean.';
        }
        return 'Write a clear response for this guest user ticket. This message will be shared with the user.';
    };



    useEffect(() => {
        fetchSupportTickets();
    }, [filters]);

    useEffect(() => {
        if (!showModal) return undefined;

        const frameId = window.requestAnimationFrame(() => {
            resizeResponseTextarea();
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [response, showModal, selectedTicket?._id]);

    useEffect(() => {
        if (!showModal) return undefined;

        if (isTicketModalMinimized) {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            return undefined;
        }

        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [showModal, isTicketModalMinimized]);

    useEffect(() => {
        return () => {
            if (attachmentPreview.url) {
                URL.revokeObjectURL(attachmentPreview.url);
            }
        };
    }, [attachmentPreview.url]);

    const fetchSupportTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                console.error('No admin token found');
                showError('Authentication token not found. Please login again.');
                return;
            }
            
            const queryParams = new URLSearchParams(filters).toString();
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            
            const response = await fetch(`${apiUrl}/api/admin/support-tickets?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const contentType = response.headers.get('content-type');
            
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Server returned non-JSON response:', contentType);
                console.error('API URL:', apiUrl);
                console.error('Response status:', response.status);
                
                if (response.status === 404) {
                    showError('API endpoint not found. Please check if the backend server is running.');
                } else {
                    showError('Backend server is not responding correctly. Please ensure the server is running and the API URL is correct.');
                }
                return;
            }
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                setTickets(data.tickets || []);
                
                const newStats = {
                    total: data.totalTickets || 0,
                    unread: data.unreadCount || 0,
                    new: data.tickets?.filter(t => t.status === 'new').length || 0,
                    inProgress: data.tickets?.filter(t => t.status === 'in-progress').length || 0,
                    resolved: data.tickets?.filter(t => t.status === 'resolved').length || 0
                };
                setStats(newStats);
            } else if (response.status === 401) {
                showError('Session expired. Please login again.');
                localStorage.removeItem('adminToken');
                window.location.href = '/admin-login';
            } else {
                console.error('API error:', data.message || response.status);
                showError(data.message || 'Failed to fetch support tickets');
            }
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            console.error('API URL being used:', apiUrl);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                showError(`Cannot connect to backend server at ${apiUrl}. Please ensure the server is running.`);
            } else {
                showError('Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTicketClick = async (ticket) => {
        if (!ticket) return;
        
        setSelectedTicket(ticket);
        setResponse(ticket.response || '');
        setStatus(ticket.status);
        setIsTicketModalMinimized(false);
        setIsTicketModalMaximized(false);
        setShowModal(true);

        if (!ticket.isRead) {
            try {
                const token = localStorage.getItem('adminToken');
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                await fetch(`${apiUrl}/api/admin/support-tickets/${ticket._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                fetchSupportTickets();
            } catch (error) {
                
            }
        }
    };

    const handleAttachmentClick = async (event, ticketId, attachmentIndex, originalName) => {
        event.preventDefault();
        event.stopPropagation();
        const token = localStorage.getItem('adminToken');
        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/admin/support-tickets/${ticketId}/attachments/${attachmentIndex}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    showError('Session expired. Please login again.');
                    localStorage.removeItem('adminToken');
                    window.location.href = '/admin-login';
                    return;
                }
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Failed to open attachment');
                return;
            }
            const blob = await response.blob();
            const fileName = originalName || `attachment-${attachmentIndex + 1}`;
            const objectURL = URL.createObjectURL(blob);
            const mimeType = blob.type || '';
            if (mimeType.startsWith('image/') || mimeType === 'application/pdf' || mimeType.startsWith('text/')) {
                setAttachmentPreview((previous) => {
                    if (previous.url) {
                        URL.revokeObjectURL(previous.url);
                    }
                    return {
                        open: true,
                        url: objectURL,
                        name: fileName,
                        type: mimeType
                    };
                });
            } else {
                const downloadLink = document.createElement('a');
                downloadLink.href = objectURL;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
            }
        } catch (error) {
            showError('Failed to open attachment. Please try again.');
        }
    };

    const closeAttachmentPreview = () => {
        setAttachmentPreview((previous) => {
            if (previous.url) {
                URL.revokeObjectURL(previous.url);
            }
            return {
                open: false,
                url: '',
                name: '',
                type: ''
            };
        });
    };

    const handleUpdateTicket = async () => {
        if (updating) return; // Prevent multiple clicks
        
        try {
            setUpdating(true);
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                showError('Authentication token not found. Please login again.');
                return;
            }
            
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const apiResponse = await fetch(`${apiUrl}/api/admin/support-tickets/${selectedTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, response })
            });

            const result = await apiResponse.json();
            
            if (apiResponse.ok && result.success) {
                showSuccess('Support ticket updated successfully');
                handleCloseModal();
                fetchSupportTickets();
            } else {
                console.error('Update failed:', result);
                showError(result.message || 'Failed to update support ticket');
            }
        } catch (error) {
            console.error('Error updating support ticket:', error);
            showError('Error updating support ticket. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const getPriorityBadge = (priority) => {
        const variants = {
            low: 'badge-soft-low',
            medium: 'badge-soft-medium',
            high: 'badge-soft-high',
            urgent: 'badge-soft-urgent'
        };
        const formatText = (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        return (
            <Badge bg="light" className={`badge-soft ${variants[priority] || ''}`}>
                {priority ? formatText(priority.replace('-', ' ')) : 'N/A'}
            </Badge>
        );
    };

    const getStatusBadge = (status) => {
        const variants = {
            new: 'badge-soft-status-new',
            'in-progress': 'badge-soft-status-in-progress',
            resolved: 'badge-soft-status-resolved',
            closed: 'badge-soft-status-closed'
        };
        const formatText = (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        return (
            <Badge bg="light" className={`badge-soft ${variants[status] || ''}`}>
                {status ? formatText(status.replace('-', ' ')) : 'N/A'}
            </Badge>
        );
    };

    const getUserTypeBadge = (userType) => {
        const variants = {
            employer: 'badge-soft-user-employer',
            candidate: 'badge-soft-user-candidate',
            placement: 'badge-soft-user-placement',
            guest: 'badge-soft-user-guest'
        };
        const displayText = {
            employer: 'Employer',
            candidate: 'Candidate',
            placement: 'Placement',
            guest: 'Guest User'
        };
        return (
            <Badge bg="light" className={`badge-soft ${variants[userType] || ''}`}>
                {userType ? displayText[userType] || 'N/A' : 'N/A'}
            </Badge>
        );
    };

    const getRequesterName = (ticket) => {
        if (!ticket) return 'N/A';
        if (ticket.userType === 'employer') {
            return ticket.requesterDisplayName || ticket.actualCompanyName || ticket.actualUserName || ticket.name || 'N/A';
        }
        return ticket.requesterDisplayName || ticket.actualUserName || ticket.name || 'N/A';
    };

    const getCompanyName = (ticket) => {
        if (!ticket) return '';
        if (ticket.userType === 'employer') {
            return ticket.actualCompanyName || '';
        }
        if (ticket.userType === 'candidate') {
            return ticket.associatedCompanyName || '';
        }
        if (ticket.userType === 'placement') {
            return ticket.actualCompanyName || '';
        }
        return '';
    };

    const getJobTitle = (ticket) => ticket?.jobId?.title || null;

    const getRequesterEmail = (ticket) => ticket?.actualUserEmail || ticket?.email || 'No email provided';

    const getRequesterLabel = (ticket) => ticket?.userType === 'employer' ? 'Company Name' : 'Name';
    const getCompanyLabel = (ticket) => ticket?.userType === 'placement' ? 'College Name' : 'Company Name';

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const normalizedJobSearch = jobSearch.trim().toLowerCase();
    const normalizedUniversitySearch = universitySearch.trim().toLowerCase();
    const normalizedCompanySearch = companySearch.trim().toLowerCase();
    const visibleTickets = tickets.filter((ticket) => {
        if (normalizedSearchTerm) {
            const requesterName = getRequesterName(ticket).toLowerCase();
            const requesterEmail = getRequesterEmail(ticket).toLowerCase();
            if (!requesterName.includes(normalizedSearchTerm) && !requesterEmail.includes(normalizedSearchTerm)) return false;
        }
        if (normalizedJobSearch) {
            const jobTitle = (getJobTitle(ticket) || '').toLowerCase();
            if (!jobTitle.includes(normalizedJobSearch)) return false;
        }
        if (normalizedUniversitySearch) {
            const universityName = ticket.userType === 'placement' ? (getCompanyName(ticket) || '').toLowerCase() : '';
            if (!universityName.includes(normalizedUniversitySearch)) return false;
        }
        if (normalizedCompanySearch) {
            const companyName = (ticket.userType === 'employer' || ticket.userType === 'candidate') ? (getCompanyName(ticket) || '').toLowerCase() : '';
            if (!companyName.includes(normalizedCompanySearch)) return false;
        }
        return true;
    });

    const handleCloseModal = () => {
        setShowModal(false);
        setIsTicketModalMinimized(false);
        setIsTicketModalMaximized(false);
        setSelectedTicket(null);
        setResponse('');
        setStatus('');
    };

    const handleToggleTicketModalMinimized = () => {
        setIsTicketModalMinimized((previous) => {
            const next = !previous;
            if (next) {
                setIsTicketModalMaximized(false);
            }
            return next;
        });
    };

    const handleToggleTicketModalMaximized = () => {
        setIsTicketModalMaximized((previous) => {
            const next = !previous;
            if (next) {
                setIsTicketModalMinimized(false);
            }
            return next;
        });
    };

    const handleResponseChange = (event) => {
        setResponse(event.target.value);
        resizeResponseTextarea(event.target);
    };

    if (loading) {
        return (
            <div className="admin-emp-manage-container">
                <PageLoader pageName="Support Tickets" />
            </div>
        );
    }

    return (
        <div className="admin-emp-manage-container">
            <div className="wt-admin-right-page-header">
                <h2>Support Tickets</h2>
                <p>Monitor and respond to customer support requests</p>
            </div>
            <Container fluid>
                <div className="stats-grid">
                        <div className="stats-card stats-card--total">
                            <span className="stats-card__label">Total</span>
                            <span className="stats-card__value">{stats.total}</span>
                        </div>
                        <div className="stats-card stats-card--new">
                            <span className="stats-card__label">New</span>
                            <span className="stats-card__value">{stats.new}</span>
                        </div>
                        <div className="stats-card stats-card--progress">
                            <span className="stats-card__label">In Progress</span>
                            <span className="stats-card__value">{stats.inProgress}</span>
                        </div>
                        <div className="stats-card stats-card--resolved">
                            <span className="stats-card__label">Resolved</span>
                            <span className="stats-card__value">{stats.resolved}</span>
                        </div>
                    </div>

                <div className="filters-section">
                        <div className="filters-section__header">
                            <h6>Filter Tickets</h6>
                            <Button
                                variant="link"
                                className="clear-filters-btn"
                                onClick={() => {
                                    setFilters({ status: '', userType: '', priority: '', category: '' });
                                    setSearchTerm('');
                                    setJobSearch('');
                                    setUniversitySearch('');
                                    setCompanySearch('');
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                        <Row className="g-3">
                            <Col md={4}>
                                <div className="search-input-wrapper">
                                    <span className="search-input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" focusable="false">
                                            <circle cx="11" cy="11" r="7"></circle>
                                            <path d="m20 20-3.5-3.5"></path>
                                        </svg>
                                    </span>
                                        <Form.Control
                                            type="search"
                                            className="search-input"
                                            placeholder="Search by requester name or email"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="filter-select-wrapper">
                                    <Form.Select
                                        className="filter-select"
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">All Status</option>
                                        <option value="new">New</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </Form.Select>
                                    <span className="filter-select-icon" aria-hidden="true">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="filter-select-wrapper">
                                    <Form.Select
                                        className="filter-select"
                                        value={filters.userType}
                                        onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                                    >
                                        <option value="">All User Types</option>
                                        <option value="employer">Employer</option>
                                        <option value="candidate">Candidate</option>
                                        <option value="placement">Placement</option>
                                    </Form.Select>
                                    <span className="filter-select-icon" aria-hidden="true">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="search-input-wrapper">
                                    <span className="search-input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" focusable="false">
                                            <circle cx="11" cy="11" r="7"></circle>
                                            <path d="m20 20-3.5-3.5"></path>
                                        </svg>
                                    </span>
                                    <Form.Control
                                        type="search"
                                        className="search-input"
                                        placeholder="Search by job title"
                                        value={jobSearch}
                                        onChange={(e) => setJobSearch(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="search-input-wrapper">
                                    <span className="search-input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" focusable="false">
                                            <circle cx="11" cy="11" r="7"></circle>
                                            <path d="m20 20-3.5-3.5"></path>
                                        </svg>
                                    </span>
                                    <Form.Control
                                        type="search"
                                        className="search-input"
                                        placeholder="Search by university name"
                                        value={universitySearch}
                                        onChange={(e) => setUniversitySearch(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="search-input-wrapper">
                                    <span className="search-input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" focusable="false">
                                            <circle cx="11" cy="11" r="7"></circle>
                                            <path d="m20 20-3.5-3.5"></path>
                                        </svg>
                                    </span>
                                    <Form.Control
                                        type="search"
                                        className="search-input"
                                        placeholder="Search by company name"
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="filter-select-wrapper">
                                    <Form.Select
                                        className="filter-select"
                                        value={filters.priority}
                                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </Form.Select>
                                    <span className="filter-select-icon" aria-hidden="true">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="filter-select-wrapper">
                                    <Form.Select
                                        className="filter-select"
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    >
                                        <option value="">All Categories</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="account">Account Management</option>
                                        <option value="job-posting">Job Posting</option>
                                        <option value="application">Job Application</option>
                                        <option value="student-application">Student/Application Query</option>
                                    </Form.Select>
                                    <span className="filter-select-icon" aria-hidden="true">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </div>

                {/* Tickets List */}
                <Row>
                    <Col>
                        <Card className="tickets-card">
                            <div className="tickets-header">
                                <div>
                                    <h5>Support Tickets ({visibleTickets.length})</h5>
                                    <span className="tickets-header__subtitle">Track ticket lifecycle and respond with clarity.</span>
                                </div>
                            </div>
                            <Card.Body className="p-0">
                                {visibleTickets.length === 0 ? (
                                    <div className="empty-state">
                                        <h6>{tickets.length === 0 ? 'No Tickets Yet' : 'No Matching Tickets'}</h6>
                                        <p>
                                            {tickets.length === 0
                                                ? 'Customer support requests will appear here as soon as they are submitted.'
                                                : 'Try a different requester name or email, or clear the active filters.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <table className="table tickets-table" style={{tableLayout: 'auto', width: '100%'}}>
                                            <thead>
                                                <tr>
                                                    <th style={{width: '20%', minWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Subject</th>
                                                    <th style={{width: '24%', whiteSpace: 'nowrap'}}>Requester</th>
                                                    <th style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>User Type</th>
                                                    <th style={{width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Company Name</th>
                                                    <th style={{width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>University  Name</th>
                                                    <th style={{width: '17%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Job</th>
                                                    <th style={{width: '12%', minWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Category</th>
                                                    <th style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Priority</th>
                                                    <th style={{width: '11%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Status</th>
                                                    <th style={{width: '11%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Created</th>
                                                    <th className="text-center" style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visibleTickets.map((ticket) => (
                                                    <tr
                                                        key={ticket._id}
                                                        className={`tickets-row ${!ticket.isRead ? 'unread-ticket' : ''}`}
                                                        onClick={() => handleTicketClick(ticket)}
                                                    >
                                                        <td className="tickets-cell--subject" title={ticket.subject}>
                                                            <div className={`ticket-subject ${!ticket.isRead ? 'ticket-subject--with-indicator' : ''}`}>
                                                                {!ticket.isRead && <span className="unread-dot" title="New Ticket"></span>}
                                                                <span className="ticket-subject-text">{ticket.subject}</span>
                                                            </div>
                                                            {!ticket.isRead && <span className="new-badge">Unread</span>}
                                                        </td>
                                                        <td style={{whiteSpace: 'nowrap'}} title={[getRequesterName(ticket), getRequesterEmail(ticket)].filter(Boolean).join(' - ')}>
                                                            <div className="user-info">
                                                                <div className="user-name">{getRequesterName(ticket)}</div>
                                                                <div className="user-email">{getRequesterEmail(ticket)}</div>
                                                            </div>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{getUserTypeBadge(ticket.userType)}</td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={(ticket.userType === 'employer' || ticket.userType === 'candidate') ? (getCompanyName(ticket) || '-') : '-'}>
                                                            <span className="category-badge">{(ticket.userType === 'employer' || ticket.userType === 'candidate') ? (getCompanyName(ticket) || '-') : '-'}</span>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={ticket.userType === 'placement' ? (getCompanyName(ticket) || '-') : '-'}>
                                                            <span className="category-badge">{ticket.userType === 'placement' ? (getCompanyName(ticket) || '-') : '-'}</span>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={formatJobTitle(getJobTitle(ticket), ticket.userType === 'candidate' ? 'No job selected' : '-')}>
                                                            <span className="category-badge">{formatJobTitle(getJobTitle(ticket), ticket.userType === 'candidate' ? 'N/A' : '-')}</span>
                                                        </td>
                                                        <td style={{minWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={ticket.category || 'General'}>
                                                            <span className="category-badge">{{ general: 'General Inquiry', technical: 'Technical Issue', account: 'Account Management', 'job-posting': 'Job Posting', application: 'Job Application', billing: 'Billing', 'student-application': 'Student/Application Query' }[ticket.category] || ticket.category || 'General'}</span>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{getPriorityBadge(ticket.priority)}</td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{getStatusBadge(ticket.status)}</td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={formatDateTime(ticket.createdAt)}>
                                                            <div className="ticket-date">{formatDate(ticket.createdAt)}</div>
                                                            <div className="user-email">{new Date(ticket.createdAt).toLocaleTimeString('en-US', {timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true})}</div>
                                                        </td>
                                                        <td style={{overflow: 'visible', textAlign: 'center'}}>
                                                            <div className="action-buttons">
                                                                <Button
                                                                    variant="light"
                                                                    className="view-btn"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleTicketClick(ticket);
                                                                    }}
                                                                >
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Ticket Detail Modal */}
            <Modal 
                id="support-ticket-modal"
                className={`support-ticket-modal${isTicketModalMinimized ? ' support-ticket-modal--minimized' : ''}`}
                show={showModal} 
                onHide={handleCloseModal}
                onEntered={() => resizeResponseTextarea()}
                size={isTicketModalMaximized ? undefined : 'lg'}
                fullscreen={isTicketModalMaximized}
                centered={!isTicketModalMinimized && !isTicketModalMaximized}
                backdrop={isTicketModalMinimized ? false : true}
                backdropClassName="support-ticket-modal-backdrop"
                dialogClassName={[
                    'support-ticket-dialog',
                    isTicketModalMinimized ? 'support-ticket-dialog--minimized' : '',
                    isTicketModalMaximized ? 'support-ticket-dialog--maximized' : ''
                ].filter(Boolean).join(' ')}
                contentClassName={[
                    'support-ticket-content',
                    isTicketModalMinimized ? 'support-ticket-content--minimized' : '',
                    isTicketModalMaximized ? 'support-ticket-content--maximized' : ''
                ].filter(Boolean).join(' ')}
            >
                <div className="support-ticket-modal-shell">
                    <div className="support-ticket-modal-topbar">
                        <h5 className="support-ticket-modal-title">{isTicketModalMinimized ? (selectedTicket?.subject || 'Ticket Details') : 'Ticket Details'}</h5>
                        <div className="support-ticket-window-controls">
                            <button
                                type="button"
                                className="support-ticket-window-btn"
                                onClick={handleToggleTicketModalMinimized}
                                aria-label={isTicketModalMinimized ? 'Restore modal' : 'Minimize modal'}
                                title={isTicketModalMinimized ? 'Restore' : 'Minimize'}
                            >
                                <i className={`fas ${isTicketModalMinimized ? 'fa-window-restore' : 'fa-minus'}`} aria-hidden="true"></i>
                            </button>
                            <button
                                type="button"
                                className="support-ticket-window-btn"
                                onClick={handleToggleTicketModalMaximized}
                                aria-label={isTicketModalMaximized ? 'Restore modal size' : 'Maximize modal'}
                                title={isTicketModalMaximized ? 'Restore' : 'Maximize'}
                            >
                                <i className={`${isTicketModalMaximized ? 'fas fa-window-restore' : 'far fa-square'}`} aria-hidden="true"></i>
                            </button>
                            <button
                                type="button"
                                className="support-ticket-window-btn support-ticket-window-btn--close"
                                onClick={handleCloseModal}
                                aria-label="Close modal"
                                title="Close"
                            >
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    {!isTicketModalMinimized && selectedTicket && (
                        <>
                            <div className="support-ticket-modal-body">
                                <div className="ticket-details-shell">
                                    <div className="ticket-details-hero">
                                        <div className="ticket-details-hero__content">
                                            <span className="ticket-details-hero__eyebrow">Support Ticket</span>
                                            <h4 className="ticket-details-hero__title">{selectedTicket.subject}</h4>
                                            <div className="ticket-details-hero__meta">
                                                <span>Ticket ID: {selectedTicket._id?.slice(-8)?.toUpperCase() || 'N/A'}</span>
                                                <span>Created: {formatDate(selectedTicket.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="ticket-details-hero__badges">
                                            <div className="ticket-details-badge-group">
                                                <span className="ticket-details-badge-label">Priority</span>
                                                {getPriorityBadge(selectedTicket.priority)}
                                            </div>
                                            <div className="ticket-details-badge-group">
                                                <span className="ticket-details-badge-label">Status</span>
                                                {getStatusBadge(selectedTicket.status)}
                                            </div>
                                            <div className="ticket-details-badge-group">
                                                <span className="ticket-details-badge-label">User Type</span>
                                                {getUserTypeBadge(selectedTicket.userType)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ticket-details-grid">
                                        <div className="ticket-detail-card">
                                            <div className="detail-label">{getRequesterLabel(selectedTicket)}</div>
                                            <div className="detail-value">{getRequesterName(selectedTicket)}</div>
                                        </div>
                                        {selectedTicket.userType !== 'employer' && getCompanyName(selectedTicket) && (
                                            <div className="ticket-detail-card">
                                                <div className="detail-label">{getCompanyLabel(selectedTicket)}</div>
                                                <div className="detail-value">{getCompanyName(selectedTicket)}</div>
                                            </div>
                                        )}
                                        {getJobTitle(selectedTicket) && (
                                            <div className="ticket-detail-card">
                                                <div className="detail-label">Job</div>
                                                <div className="detail-value">{formatJobTitle(getJobTitle(selectedTicket))}</div>
                                            </div>
                                        )}
                                        <div className="ticket-detail-card">
                                            <div className="detail-label">Email</div>
                                            <div className="detail-value detail-value--break">{getRequesterEmail(selectedTicket)}</div>
                                        </div>
                                        <div className="ticket-detail-card">
                                            <div className="detail-label">Category</div>
                                            <div className="detail-value">{selectedTicket.category || 'General'}</div>
                                        </div>
                                    </div>

                                    <div className="ticket-detail-section mb-3">
                                        <div className="detail-label">Message</div>
                                        <div className="message-box">
                                            {selectedTicket.message}
                                        </div>
                                    </div>
                                </div>
                                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                <div className="ticket-detail-section mb-3">
                                    <div className="detail-label">Attachments</div>
                                    <ul className="attachment-list">
                                        {selectedTicket.attachments.map((attachment, index) => (
                                            <li key={index} className="attachment-item">
                                                <button 
                                                    className="attachment-link"
                                                    onClick={(event) => handleAttachmentClick(event, selectedTicket._id, index, attachment.originalName)}
                                                >
                                                    {attachment.originalName}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="ticket-admin-panel">
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="detail-label">Status</Form.Label>
                                            <div className="filter-select-wrapper">
                                                <Form.Select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                                    <option value="new">New</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                </Form.Select>
                                                <span className="filter-select-icon" aria-hidden="true">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-0">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="detail-label">Admin Response<span style={{ color: 'red' }}>*</span></Form.Label>
                                            <Form.Control
                                                ref={responseTextareaRef}
                                                as="textarea"
                                                className="response-textarea"
                                                placeholder={getResponsePlaceholder(selectedTicket?.userType)}
                                                value={response}
                                                onChange={handleResponseChange}
                                            />
                                            <small className="text-muted">Enter a clear update or resolution note. Your response will be sent to the {getResponseTargetLabel(selectedTicket?.userType)} as a notification.</small>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                            <div className="support-ticket-modal-footer">
                                {response.trim() && <Button
                                    variant="outline-primary"
                                    className="update-btn"
                                    onClick={handleUpdateTicket}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Saving
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>}
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <Modal
                show={attachmentPreview.open}
                onHide={closeAttachmentPreview}
                size="xl"
                centered
                dialogClassName="attachment-preview-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{attachmentPreview.name || 'Attachment Preview'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="attachment-preview-modal__body">
                    {attachmentPreview.type.startsWith('image/') ? (
                        <img
                            src={attachmentPreview.url}
                            alt={attachmentPreview.name || 'Attachment preview'}
                            className="attachment-preview-modal__image"
                        />
                    ) : (
                        <iframe
                            src={attachmentPreview.url}
                            title={attachmentPreview.name || 'Attachment preview'}
                            className="attachment-preview-modal__frame"
                        />
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default AdminSupportTickets;
