import React, { useState, useEffect } from 'react';
import { formatDate as formatDateUtil } from '../../../../utils/dateFormatter';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import '../../admin/components/admin-support-tickets.css';
import '../../admin/components/admin-emp-manage-styles.css';
import { showSuccess, showError, showConfirmation } from '../../../../utils/popupNotification';
import { api } from '../../../../utils/api';

function EmployerSupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isTicketModalMinimized, setIsTicketModalMinimized] = useState(false);
    const [isTicketModalMaximized, setIsTicketModalMaximized] = useState(false);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        receiver: 'employer'
    });
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        new: 0,
        inProgress: 0,
        resolved: 0
    });
    const [updating, setUpdating] = useState(false);

    const formatDate = (value) => {
        if (!value) return '--';
        return formatDateUtil(value);
    };

    useEffect(() => {
        fetchSupportTickets();
    }, [filters]);

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

    const fetchSupportTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('employerToken');
            
            if (!token) {
                showError('Authentication token not found. Please login again.');
                return;
            }
            
            const data = await api.getEmployerSupportTickets(filters);
            
            if (data.success) {
                setTickets(data.tickets || []);
                
                const newStats = {
                    total: data.totalTickets || 0,
                    unread: data.unreadCount || 0,
                    new: data.tickets?.filter(t => t.status === 'new').length || 0,
                    inProgress: data.tickets?.filter(t => t.status === 'in-progress').length || 0,
                    resolved: data.tickets?.filter(t => t.status === 'resolved').length || 0
                };
                setStats(newStats);
            } else if (data.message && (data.message.includes('expired') || data.message.includes('Unauthorized'))) {
                showError('Session expired. Please login again.');
                localStorage.removeItem('employerToken');
                window.location.href = '/employer-login';
            } else {
                showError(data.message || 'Failed to fetch support tickets');
            }
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            showError('Network error. Please check your connection and try again.');
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
                await api.getEmployerSupportTicketById(ticket._id);
                fetchSupportTickets();
            } catch (error) {
                console.error('Error marking ticket as read:', error);
            }
        }
    };

    const handleAttachmentClick = async (event, ticketId, attachmentIndex, originalName) => {
        event.preventDefault();
        event.stopPropagation();
        const token = localStorage.getItem('employerToken');
        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }
        try {
            const response = await api.downloadEmployerSupportAttachment(ticketId, attachmentIndex);
            if (!response.ok) {
                if (response.status === 401) {
                    showError('Session expired. Please login again.');
                    localStorage.removeItem('employerToken');
                    window.location.href = '/employer-login';
                    return;
                }
                const errorData = await response.json().catch(() => ({}));
                showError(errorData.message || 'Failed to open attachment');
                return;
            }
            const blob = await response.blob();
            const fileName = originalName || `attachment-${attachmentIndex + 1}`;
            const objectURL = URL.createObjectURL(blob);
            if (blob.type.startsWith('image/')) {
                const imageWindow = window.open();
                if (imageWindow) {
                    imageWindow.document.write(`<title>${fileName}</title><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;"><img src="${objectURL}" style="max-width:100%;height:auto;"/></body>`);
                } else {
                    window.open(objectURL, '_blank');
                }
            } else {
                const downloadLink = document.createElement('a');
                downloadLink.href = objectURL;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
            setTimeout(() => URL.revokeObjectURL(objectURL), 10000);
        } catch (error) {
            alert('Failed to open attachment. Please try again.');
        }
    };

    const handleUpdateTicket = async () => {
        if (updating) return;
        
        try {
            setUpdating(true);
            const token = localStorage.getItem('employerToken');
            
            if (!token) {
                showError('Authentication token not found. Please login again.');
                return;
            }
            
            const result = await api.updateEmployerSupportTicket(selectedTicket._id, { status, response });
            
            if (result.success) {
                showSuccess('Support ticket updated successfully');
                handleCloseModal();
                fetchSupportTickets();
            } else {
                showError(result.message || 'Failed to update support ticket');
            }
        } catch (error) {
            console.error('Error updating support ticket:', error);
            showError('Error updating support ticket. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleCloseTicket = async (ticketId) => {
        showConfirmation(
            'Are you sure you want to close this support ticket? This will mark it as resolved.',
            async () => {
                try {
                    const token = localStorage.getItem('employerToken');
                    
                    if (!token) {
                        showError('Authentication token not found. Please login again.');
                        return;
                    }
                    
                    const result = await api.updateEmployerSupportTicket(ticketId, { 
                        status: 'closed',
                        response: 'Ticket closed by employer'
                    });
                    
                    if (result.success) {
                        await fetchSupportTickets();
                        showSuccess('Support ticket closed successfully');
                        if (showModal && selectedTicket && selectedTicket._id === ticketId) {
                            handleCloseModal();
                        }
                    } else {
                        showError(result.message || 'Failed to close support ticket');
                    }
                } catch (error) {
                    console.error('Error closing support ticket:', error);
                    showError('Error closing support ticket. Please try again.');
                }
            },
            () => {},
            'info'
        );
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

    const getJobTitle = (ticket) => ticket?.supportDesignation || ticket?.relatedJobTitle || ticket?.jobId?.title || '';
    const getCompanyName = (ticket) => ticket?.supportCompanyName || ticket?.relatedCompanyName || ticket?.jobId?.companyName || 'N/A';

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-content employer-support-tickets-page employer-page-shell employer-page-shell--content">
            <div className="wt-admin-right-page-header employer-page-header-card">
                <h2>Candidate Support Tickets</h2>
                <p>Monitor and respond to candidate support requests</p>
            </div>
            <Container fluid>
                <div className="stats-grid">
                    <div className="stats-card stats-card--total">
                        <span className="stats-card__label">Total</span>
                        <span className="stats-card__value">{stats.total}</span>
                    </div>
                    <div className="stats-card stats-card--unread">
                        <span className="stats-card__label">Unread</span>
                        <span className="stats-card__value">{stats.unread}</span>
                    </div>
                    <div className="stats-card stats-card--new">
                        <span className="stats-card__label">New</span>
                        <span className="stats-card__value">{stats.new}</span>
                    </div>
                    <div className="stats-card stats-card--progress">
                        <span className="stats-card__label">In progress</span>
                        <span className="stats-card__value">{stats.inProgress}</span>
                    </div>
                    <div className="stats-card stats-card--resolved">
                        <span className="stats-card__label">Resolved</span>
                        <span className="stats-card__value">{stats.resolved}</span>
                    </div>
                </div>

                <div className="filters-section">
                    <div className="filters-section__header">
                        <h6>Filter Ticktes</h6>
                        <Button
                            variant="link"
                            className="clear-filters-btn"
                            onClick={() => setFilters({ status: '', priority: '', receiver: 'employer' })}
                        >
                            Reset filters
                        </Button>
                    </div>
                    <Row className="g-3">
                        <Col md={6}>
                            <div className="filter-select-wrapper">
                                <Form.Select
                                    className="filter-select"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="">All status</option>
                                    <option value="new">New</option>
                                    <option value="in-progress">In progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </Form.Select>
                                <i className="fa fa-chevron-down filter-select-icon" aria-hidden="true"></i>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="filter-select-wrapper">
                                <Form.Select
                                    className="filter-select"
                                    value={filters.priority}
                                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                >
                                    <option value="">All priorities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </Form.Select>
                                <i className="fa fa-chevron-down filter-select-icon" aria-hidden="true"></i>
                            </div>
                        </Col>
                    </Row>
                </div>

                <Row>
                    <Col>
                        <Card className="tickets-card">
                            <div className="tickets-header">
                                <div>
                                    <h5>Support Tickets ({tickets.length})</h5>
                                    <span className="tickets-header__subtitle">Track ticket lifecycle and respond with clarity.</span>
                                </div>
                            </div>
                            <Card.Body className="p-0">
                                {tickets.length === 0 ? (
                                    <div className="empty-state">
                                        <h6>No tickets available</h6>
                                        <p>Candidate support requests will appear here once submitted.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table tickets-table" style={{tableLayout: 'fixed', width: '100%'}}>
                                            <thead>
                                                <tr>
                                                    <th style={{width: '18%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Subject</th>
                                                    <th style={{width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Company Name</th>
                                                    <th style={{width: '14%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Designation</th>
                                                    <th style={{width: '16%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Name / Email</th>
                                                    <th style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Category</th>
                                                    <th style={{width: '8%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Priority</th>
                                                    <th style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Status</th>
                                                    <th style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Created</th>
                                                    <th className="text-center" style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tickets.map((ticket) => (
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
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={getCompanyName(ticket)}>
                                                            <span className="category-badge">{getCompanyName(ticket)}</span>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={getJobTitle(ticket) || 'No designation selected'}>
                                                            <span className="category-badge">{getJobTitle(ticket) || 'N/A'}</span>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={`${ticket.name || 'N/A'} - ${ticket.email || 'No email'}`}>
                                                            <div className="user-info">
                                                                <div className="user-name">{ticket.name || 'N/A'}</div>
                                                                <div className="user-email">{ticket.email || 'No email'}</div>
                                                            </div>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={ticket.category || 'General'}>
                                                            <span className="category-badge">{ticket.category || 'General'}</span>
                                                        </td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{getPriorityBadge(ticket.priority)}</td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{getStatusBadge(ticket.status)}</td>
                                                        <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={formatDate(ticket.createdAt)}>
                                                            <div className="ticket-date">{formatDate(ticket.createdAt)}</div>
                                                        </td>
                                                        <td className="text-center" style={{overflow: 'visible'}}>
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

            <Modal 
                id="support-ticket-modal"
                className={`support-ticket-modal${isTicketModalMinimized ? ' support-ticket-modal--minimized' : ''}`}
                show={showModal} 
                onHide={handleCloseModal}
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
                        <h5 className="support-ticket-modal-title">
                            {isTicketModalMinimized ? (selectedTicket?.subject || 'Ticket details') : 'Ticket details'}
                        </h5>
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
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <div className="detail-label">Company Name</div>
                                        <div className="detail-value detail-value--break">{getCompanyName(selectedTicket)}</div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="detail-label">Designation</div>
                                        <div className="detail-value detail-value--break">{getJobTitle(selectedTicket) || 'N/A'}</div>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <div className="detail-label">Name / Email</div>
                                        <div className="detail-value detail-value--break">{selectedTicket.name || 'N/A'}</div>
                                        <div className="detail-value detail-value--break" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
                                            {selectedTicket.email || 'No email'}
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="detail-label">Subject</div>
                                        <div className="detail-value detail-value--break">{selectedTicket.subject}</div>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <div className="detail-label">Category</div>
                                        <div className="detail-value detail-value--break">{selectedTicket.category || 'General'}</div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="detail-label">Priority</div>
                                        <div>{getPriorityBadge(selectedTicket.priority)}</div>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <div className="detail-label">Status</div>
                                        <div>{getStatusBadge(selectedTicket.status)}</div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="detail-label">Created</div>
                                        <div className="detail-value">{formatDate(selectedTicket.createdAt)}</div>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col>
                                        <div className="detail-label">Message</div>
                                        <div className="message-box">
                                            {selectedTicket.message}
                                        </div>
                                    </Col>
                                </Row>
                                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                    <Row className="mb-3">
                                        <Col>
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
                                        </Col>
                                    </Row>
                                )}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="detail-label">Status</Form.Label>
                                            <Form.Select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                                <option value="new">New</option>
                                                <option value="in-progress">In progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="detail-label">Your Response</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                className="response-textarea"
                                                placeholder="Type your response here... This will be sent as a notification to the candidate."
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                            />
                                            <small className="text-muted">Your response will be sent as a notification to the candidate.</small>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                            <div className="support-ticket-modal-footer">
                                <Button
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
                                        'Save changes'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default EmployerSupportTickets;
