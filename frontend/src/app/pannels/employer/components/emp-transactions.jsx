import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { loadScript, publicUrlFor } from "../../../../globals/constants";
import { ListChecks, Search, Receipt, Download, Eye, X } from "lucide-react";
import "../../../../styles/print-receipt.css";

function EmpTransactionsPage() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    useEffect(() => {
        loadScript("js/custom.js");
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem("employerToken");
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch("http://localhost:5000/api/payments/employer-transactions", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentDetails = async (paymentId) => {
        setFetchingDetails(true);
        try {
            const token = localStorage.getItem("employerToken");
            const response = await fetch(`http://localhost:5000/api/payments/details/${paymentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setPaymentDetails(data.payment);
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
        } finally {
            setFetchingDetails(false);
        }
    };

    const handleViewInvoice = (transaction) => {
        setSelectedTransaction(transaction);
        setPaymentDetails(null);
        setShowInvoiceModal(true);
        if (transaction.paymentId) {
            fetchPaymentDetails(transaction.paymentId);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTransactions = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return transactions.filter((t) => {
            const name = t.candidateId?.name?.toLowerCase() || "";
            const email = t.candidateId?.email?.toLowerCase() || "";
            const jobTitle = t.jobId?.title?.toLowerCase() || "";
            const paymentId = t.paymentId?.toLowerCase() || "";
            return name.includes(q) || email.includes(q) || jobTitle.includes(q) || paymentId.includes(q);
        });
    }, [transactions, searchText]);

    return (
        <div className="twm-right-section-panel site-bg-gray emp-candidates-page" style={{
            width: '100%',
            margin: 0,
            padding: 0,
            background: '#f7f7f7',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
                <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <h2 className="m-0">Transaction History</h2>
                    <p className="text-muted m-0 mt-1">View all candidate application payments and invoices</p>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
                <div className="panel panel-default site-bg-white p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
                    
                    <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="input-group" style={{ maxWidth: 400 }}>
                            <span className="input-group-text bg-white border-end-0">
                                <Search size={18} style={{ color: "#f97316" }} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search by name, job or payment ID..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="text-muted">
                            Total Transactions: <strong>{filteredTransactions.length}</strong>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover twm-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Candidate</th>
                                        <th>Job Role</th>
                                        <th>Payment ID</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map((t) => (
                                            <tr key={t._id}>
                                                <td>
                                                    <div className="text-nowrap">{new Date(t.createdAt).toLocaleDateString()}</div>
                                                    <small className="text-muted">{new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                                </td>
                                                <td>
                                                    <div className="fw-bold">{t.candidateId?.name || 'Guest'}</div>
                                                    <small className="text-muted">{t.candidateId?.email}</small>
                                                </td>
                                                <td>{t.jobId?.title || 'N/A'}</td>
                                                <td><code className="text-primary">{t.paymentId}</code></td>
                                                <td>
                                                    <span className="fw-bold">₹{t.paymentAmount || 129}</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success-light text-success text-uppercase" style={{backgroundColor: '#e6f4ea', color: '#1e7e34', padding: '5px 10px', borderRadius: '4px'}}>
                                                        {t.paymentStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="twm-table-controls">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button 
                                                                    title="View Details" 
                                                                    onClick={() => handleViewInvoice(t)}
                                                                >
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Modal */}
            {showInvoiceModal && createPortal(
                <div className="modal fade show" style={{ 
                    display: 'block', 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    zIndex: 110000,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title d-flex align-items-center gap-2">
                                    <Receipt size={20} className="text-primary" />
                                    Transaction Details
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                {fetchingDetails ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2 text-muted">Fetching Razorpay details...</p>
                                    </div>
                                ) : (
                                    <div id="invoice-content">
                                        <div className="d-flex justify-content-between mb-4 align-items-center">
                                            <div>
                                                <img src={publicUrlFor('images/logo-dark.png')} alt="TaleGlobal Logo" style={{ height: '40px', marginBottom: '10px' }} />
                                                <p className="text-muted small mb-0">Platform for Jobs & Assessments</p>
                                                <p className="text-muted small mb-0"><strong>GST:</strong> 29ABCFG9123F1Z</p>
                                            </div>
                                            <div className="text-end">
                                                <h5 className="mb-0 text-primary">TRANSACTION INVOICE</h5>
                                                <p className="text-muted small mb-0">Date: {formatDate(selectedTransaction?.createdAt)}</p>
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="row mb-4">
                                            <div className="col-6">
                                                <p className="text-muted small mb-1 fw-bold text-uppercase">Candidate Details</p>
                                                <h6 className="mb-0">{selectedTransaction?.candidateId?.name}</h6>
                                                <p className="text-muted small mb-0">{selectedTransaction?.candidateId?.email}</p>
                                                {selectedTransaction?.candidateId?.phone && (
                                                    <p className="text-muted small mb-0">{selectedTransaction?.candidateId?.phone}</p>
                                                )}
                                            </div>
                                            <div className="col-6 text-end">
                                                <p className="text-muted small mb-1 fw-bold text-uppercase">Payment Info</p>
                                                <p className="mb-0 small"><strong>Order ID:</strong> {selectedTransaction?.orderId}</p>
                                                <p className="mb-0 small"><strong>Payment ID:</strong> {selectedTransaction?.paymentId}</p>
                                                <p className="mb-0 small"><strong>Method:</strong> {paymentDetails?.method || 'Online'}</p>
                                                <p className="mb-0 small"><strong>Status:</strong> <span className="text-success fw-bold text-uppercase">{selectedTransaction?.paymentStatus}</span></p>
                                            </div>
                                        </div>

                                        <div className="table-responsive mb-4">
                                            <table className="table table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Description</th>
                                                        <th className="text-center">Qty</th>
                                                        <th className="text-end">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <div className="fw-bold text-primary">Job Application Fee</div>
                                                            <div className="small mt-1">
                                                                <strong>Job:</strong> {selectedTransaction?.jobId?.title}<br />
                                                                {selectedTransaction?.jobId?.jobCategory && (
                                                                    <span><strong>Category:</strong> {selectedTransaction?.jobId?.jobCategory}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-center align-middle">1</td>
                                                        <td className="text-end align-middle">₹{(selectedTransaction?.paymentAmount || 129).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                                <tfoot>
                                                    <tr className="table-light">
                                                        <th colSpan="2" className="text-end">Total Amount</th>
                                                        <th className="text-end text-primary">₹{(selectedTransaction?.paymentAmount || 129).toFixed(2)}</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <div className="bg-light p-3 rounded border text-center">
                                            <p className="mb-0 small text-muted">
                                                This is a computer-generated invoice for the record of payment made on TaleGlobal.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary d-flex align-items-center gap-2 receipt-print-btn" onClick={() => window.print()}>
                                    <Download size={16} /> Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default EmpTransactionsPage;
