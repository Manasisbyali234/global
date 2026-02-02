import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { loadScript, publicUrlFor } from "../../../../globals/constants";
import { Search, Receipt, Download, Eye } from "lucide-react";
import { api } from "../../../../utils/api";
import "../../../../styles/print-receipt.css";

function AdminTransactionsPage() {
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
            const data = await api.getAllTransactions();
            if (data.success) {
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
            const data = await api.getPaymentDetails(paymentId);
            if (data.success) {
                setPaymentDetails(data.payment);
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
        } finally {
            setFetchingDetails(false);
        }
    };

    const getPaymentMethodInfo = (details) => {
        if (!details) return "Online Payment";
        
        const method = details.method?.toLowerCase();
        switch (method) {
            case 'card':
                return `Card (**** ${details.card?.last4 || ''})`;
            case 'upi':
                return `UPI (${details.vpa || 'Mobile App'})`;
            case 'netbanking':
                return `Netbanking (${details.bank || 'Bank Transfer'})`;
            case 'wallet':
                return `Wallet (${details.wallet || 'Digital Wallet'})`;
            case 'credits':
                return 'Platform Credits';
            default:
                return details.method ? details.method.toUpperCase() : "Online Payment";
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
            const candidateName = t.candidateId?.name?.toLowerCase() || "";
            const employerName = t.employerId?.companyName?.toLowerCase() || "";
            const jobTitle = t.jobId?.title?.toLowerCase() || "";
            const paymentId = t.paymentId?.toLowerCase() || "";
            return candidateName.includes(q) || employerName.includes(q) || jobTitle.includes(q) || paymentId.includes(q);
        });
    }, [transactions, searchText]);

    return (
        <div className="twm-right-section-panel site-bg-gray" style={{
            width: '100%',
            margin: 0,
            padding: 0,
            background: '#f7f7f7',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
                <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <h2 className="m-0">All Transactions</h2>
                    <p className="text-muted m-0 mt-1">Monitor all platform payments from candidates</p>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
                <div className="panel panel-default site-bg-white p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
                    
                    <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="input-group" style={{ maxWidth: 450 }}>
                            <span className="input-group-text bg-white border-end-0">
                                <Search size={18} style={{ color: "#f97316" }} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search by candidate, company, job or payment ID..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="text-muted">
                            Total Platform Revenue: <strong>₹{(transactions.reduce((acc, t) => acc + (t.paymentAmount || 129), 0)).toLocaleString()}</strong> | Count: <strong>{filteredTransactions.length}</strong>
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
                                        <th>Company</th>
                                        <th>Job Role</th>
                                        <th>Payment ID</th>
                                        <th>Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                No transactions found on the platform.
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
                                                    <div className="fw-bold">{t.candidateId?.name || 'N/A'}</div>
                                                    <small className="text-muted">{t.candidateId?.email}</small>
                                                </td>
                                                <td>
                                                    <div className="fw-bold">{t.employerId?.companyName || 'N/A'}</div>
                                                    <small className="text-muted">{t.employerId?.email}</small>
                                                </td>
                                                <td>{t.jobId?.title || 'N/A'}</td>
                                                <td><code className="text-primary">{t.paymentId}</code></td>
                                                <td>
                                                    <span className="fw-bold">₹{t.paymentAmount || 129}</span>
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
                    zIndex: 2147483647,
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
                                    Platform Transaction Receipt
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
                                    <div id="invoice-content" className="p-2">
                                        <div className="d-flex justify-content-between mb-4 align-items-start border-bottom pb-4">
                                            <div>
                                                <img src={publicUrlFor('images/logo-dark.png')} alt="TaleGlobal Logo" style={{ height: '45px', marginBottom: '15px' }} />
                                                <div className="text-muted small">
                                                    <p className="mb-1 fw-bold text-dark">TALEGLOBAL PLATFORM</p>
                                                    <p className="mb-1">Whitefield, Bengaluru, Karnataka 560066</p>
                                                    <p className="mb-1"><strong>GSTIN:</strong> 29ABCFG9123F1Z</p>
                                                    <p className="mb-0"><strong>Email:</strong> finance@taleglobal.com</p>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <h3 className="mb-2 text-primary fw-bold">TAX INVOICE</h3>
                                                <div className="text-muted small">
                                                    <p className="mb-1"><strong>Receipt No:</strong> REC-{selectedTransaction?.paymentId?.slice(-8).toUpperCase()}</p>
                                                    <p className="mb-1"><strong>Date:</strong> {formatDate(selectedTransaction?.createdAt)}</p>
                                                    <p className="mb-0"><strong>Status:</strong> <span className="badge bg-success text-uppercase">Paid</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row mb-5">
                                            <div className="col-6">
                                                <p className="text-muted small mb-2 fw-bold text-uppercase border-bottom pb-1">Billed To (Candidate)</p>
                                                <h6 className="mb-1 fw-bold text-dark">{selectedTransaction?.candidateId?.name}</h6>
                                                <p className="text-muted small mb-1"><i className="fa fa-envelope me-1"></i> {selectedTransaction?.candidateId?.email}</p>
                                                <p className="text-muted small mb-0"><i className="fa fa-phone me-1"></i> {selectedTransaction?.candidateId?.phone || 'N/A'}</p>
                                            </div>
                                            <div className="col-6">
                                                <p className="text-muted small mb-2 fw-bold text-uppercase border-bottom pb-1 text-end">Payment Information</p>
                                                <div className="small">
                                                    <div className="d-flex justify-content-end mb-1">
                                                        <span className="text-muted" style={{ minWidth: '100px' }}>Method:</span>
                                                        <span className="text-dark fw-bold ms-2">{getPaymentMethodInfo(paymentDetails)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-end mb-1">
                                                        <span className="text-muted" style={{ minWidth: '100px' }}>Transaction ID:</span>
                                                        <span className="text-dark fw-bold ms-2">{selectedTransaction?.paymentId}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-end mb-1">
                                                        <span className="text-muted" style={{ minWidth: '100px' }}>Order ID:</span>
                                                        <span className="text-dark fw-bold ms-2">{selectedTransaction?.orderId}</span>
                                                    </div>
                                                    {paymentDetails?.email && (
                                                        <div className="d-flex justify-content-end mb-0">
                                                            <span className="text-muted" style={{ minWidth: '100px' }}>Payer Email:</span>
                                                            <span className="text-dark fw-bold ms-2">{paymentDetails.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive mb-4">
                                            <table className="table table-bordered align-middle">
                                                <thead className="table-light text-uppercase small">
                                                    <tr>
                                                        <th style={{ width: '60%' }}>Service Description</th>
                                                        <th className="text-center">Applied</th>
                                                        <th className="text-end">Unit Price</th>
                                                        <th className="text-end">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <div className="fw-bold text-dark">Job Application Fee</div>
                                                            <div className="text-muted small mt-1">
                                                                <strong>Position:</strong> {selectedTransaction?.jobId?.title}<br />
                                                                <strong>Employer:</strong> {selectedTransaction?.employerId?.companyName}<br />
                                                                {selectedTransaction?.jobId?.jobCategory && (
                                                                    <span><strong>Category:</strong> {selectedTransaction?.jobId?.jobCategory}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-center">1</td>
                                                        <td className="text-end">₹{((selectedTransaction?.paymentAmount || 129) * 1).toFixed(2)}</td>
                                                        <td className="text-end fw-bold">₹{((selectedTransaction?.paymentAmount || 129) * 1).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                                <tfoot className="table-light">
                                                    <tr>
                                                        <th colSpan="3" className="text-end small text-uppercase">Subtotal</th>
                                                        <th className="text-end">₹{((selectedTransaction?.paymentAmount || 129) * 1).toFixed(2)}</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className="text-end small text-uppercase">Tax (GST 0%)</th>
                                                        <th className="text-end">₹0.00</th>
                                                    </tr>
                                                    <tr className="border-top border-primary border-2">
                                                        <th colSpan="3" className="text-end text-primary fw-bold text-uppercase">Grand Total</th>
                                                        <th className="text-end text-primary fw-bold fs-5">₹{((selectedTransaction?.paymentAmount || 129) * 1).toFixed(2)}</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        <div className="row mt-5 mb-3">
                                            <div className="col-8">
                                                <div className="p-3 rounded border bg-light" style={{ borderLeft: '4px solid #f97316 !important' }}>
                                                    <h6 className="small fw-bold text-uppercase mb-2 text-dark">Notes & Terms</h6>
                                                    <ul className="list-unstyled small text-muted mb-0" style={{ fontSize: '11px' }}>
                                                        <li>• This is a computer-generated document and does not require a physical signature.</li>
                                                        <li>• Application fee is non-refundable once the application is processed.</li>
                                                        <li>• For support, please contact help@taleglobal.com with your Transaction ID.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-4 text-center d-flex flex-column align-items-center justify-content-center">
                                                <div className="border-bottom w-75 mb-1" style={{ height: '40px', borderStyle: 'dashed !important' }}></div>
                                                <p className="small text-muted mb-0">Authorized Signatory</p>
                                                <p className="fw-bold text-primary small">TALEGLOBAL ADMIN</p>
                                            </div>
                                        </div>

                                        <div className="invoice-footer d-none d-print-block mt-5 pt-3 border-top text-center text-muted small">
                                            <p className="mb-1">© {new Date().getFullYear()} TaleGlobal Platform. All rights reserved.</p>
                                            <p className="mb-0">www.taleglobal.com | Whitefield, Bengaluru, Karnataka 560066</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary d-flex align-items-center gap-2 receipt-print-btn" onClick={() => window.print()}>
                                    <Download size={16} /> Print Record
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

export default AdminTransactionsPage;
