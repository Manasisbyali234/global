import { useEffect, useState, useMemo } from "react";
import { formatDate } from '../../../../utils/dateFormatter';
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { loadScript, publicUrlFor } from "../../../../globals/constants";
import { ListChecks, Search, Receipt, Download, Eye, X } from "lucide-react";
import { api } from "../../../../utils/api";
import "../../../../styles/print-receipt.css";

function CanTransactionsPage() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [candidateInfo, setCandidateInfo] = useState(null);

    useEffect(() => {
        loadScript("js/custom.js");
        fetchTransactions();
        
        // Load candidate info from localStorage
        try {
            const cachedUser = localStorage.getItem('candidateUser');
            if (cachedUser) {
                setCandidateInfo(JSON.parse(cachedUser));
            }
        } catch (e) {
            console.error('Error loading candidate info:', e);
        }
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await api.getCandidateTransactions();
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

    const getReceiptNumber = (transaction, index) => {
        const date = transaction?.createdAt ? new Date(transaction.createdAt) : new Date();
        const year = date.getFullYear();
        const safeIndex = Number.isFinite(index) && index >= 0 ? index + 1 : 1;
        const rawSerial = transaction?.receiptSerial ?? safeIndex;
        const serial = String(rawSerial).slice(-2).padStart(2, '0');
        return `${serial}/${year}-${year + 1}`;
    };

    const handlePrintReceipt = () => {
        const printContent = document.getElementById('invoice-content');
        if (!printContent) return;
        
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment Receipt</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body { padding: 20px; font-family: Arial, sans-serif; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                        .text-primary { color: #f97316 !important; }
                        .badge { padding: 4px 8px; border-radius: 4px; }
                        .bg-success { background-color: #e6f4ea !important; color: #1e7e34 !important; }
                        @page { size: A4; margin: 10mm; }
                        #invoice-content { padding: 0 !important; font-size: 11px !important; line-height: 1.35 !important; }
                        #invoice-content h3 { font-size: 16px !important; }
                        #invoice-content h5,
                        #invoice-content h6 { font-size: 13px !important; }
                        #invoice-content .text-muted,
                        #invoice-content small,
                        #invoice-content .small { font-size: 10.5px !important; }
                        #invoice-content .receipt-table,
                        #invoice-content table { width: 100% !important; min-width: 0 !important; font-size: 11px !important; }
                        #invoice-content .receipt-table th,
                        #invoice-content .receipt-table td,
                        #invoice-content table th,
                        #invoice-content table td { padding: 6px 8px !important; }
                        #invoice-content .border-bottom { margin-bottom: 10px !important; padding-bottom: 10px !important; }
                        #invoice-content .mb-3 { margin-bottom: 10px !important; }
                        #invoice-content .mb-4 { margin-bottom: 12px !important; }
                        #invoice-content .mb-5 { margin-bottom: 14px !important; }
                        #invoice-content .mt-5 { margin-top: 14px !important; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()" class="btn btn-primary">Print</button>
                        <button onclick="window.close()" class="btn btn-secondary">Close</button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const filteredTransactions = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        const isCreditTransaction =
            (t) =>
                String(t?.paymentId || '').startsWith('credit_') ||
                String(t?.orderId || '').startsWith('credit_order_') ||
                String(t?.paymentCurrency || '').toUpperCase() === 'CREDITS' ||
                Number(t?.paymentAmount) === 0;
        return transactions.filter((t) => {
            if (isCreditTransaction(t)) {
                return false;
            }
            const jobTitle = t.jobId?.title?.toLowerCase() || "";
            const employerName = t.employerId?.companyName?.toLowerCase() || "";
            const paymentId = t.paymentId?.toLowerCase() || "";
            return jobTitle.includes(q) || employerName.includes(q) || paymentId.includes(q);
        });
    }, [transactions, searchText]);

    const getReceiptAmountBreakdown = (amount) => {
        const totalPaid = Number(amount || 129);
        const roundTo2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
        const taxableValue = roundTo2(totalPaid / 1.18);
        const cgst = roundTo2(taxableValue * 0.09);
        const sgst = roundTo2(totalPaid - taxableValue - cgst);
        return { totalPaid, taxableValue, cgst, sgst };
    };

    const getTransactionStatusDisplay = (transaction) => {
        const isCreditTransaction =
            String(transaction?.paymentId || '').startsWith('credit_') ||
            String(transaction?.paymentCurrency || '').toUpperCase() === 'CREDITS' ||
            Number(transaction?.paymentAmount) === 0;

        if (isCreditTransaction) {
            return {
                label: 'Free Credit Used',
                style: {
                    backgroundColor: '#0d6efd',
                    color: '#ffffff',
                    boxShadow: '0 2px 4px rgba(13, 110, 253, 0.2)'
                }
            };
        }

        return {
            label: transaction?.paymentStatus || 'Paid',
            style: {
                backgroundColor: '#10b981',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
            }
        };
    };

    return (
        <div className="twm-right-section-panel site-bg-gray" style={{
            width: '100%',
            margin: 0,
            padding: 0,
            background: '#f7f7f7',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{ padding: 'clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem) clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)' }}>
                <div className="wt-admin-right-page-header clearfix" style={{ background: 'white', borderRadius: '12px', padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <h2 className="m-0" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>My Transactions</h2>
                    <p className="text-muted m-0 mt-1" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>View and download receipts for your job applications</p>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem)' }}>
                <div className="panel panel-default site-bg-white" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0, padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                    
                    <div className="mb-3 mb-md-4 d-flex justify-content-between align-items-center flex-wrap gap-2 gap-md-3">
                        <div className="input-group" style={{ maxWidth: '100%', width: '100%' }}>
                            <span className="input-group-text bg-white border-end-0">
                                <Search size={18} style={{ color: "#f97316" }} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Search transactions..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                            />
                        </div>
                        <div className="text-muted" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                            Total: <strong>{filteredTransactions.length}</strong>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table className="table table-hover twm-table" style={{ minWidth: '700px', fontSize: 'clamp(0.8rem, 2vw, 0.95rem)' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ minWidth: '100px' }}>Date</th>
                                        <th style={{ minWidth: '150px' }}>Job Role</th>
                                        <th className="d-none d-md-table-cell" style={{ minWidth: '120px' }}>Company</th>
                                        <th className="d-none d-lg-table-cell" style={{ minWidth: '120px' }}>Payment ID</th>
                                        <th style={{ minWidth: '80px' }}>Amount</th>
                                        <th style={{ minWidth: '80px' }}>Status</th>
                                        <th className="text-center" style={{ minWidth: '70px' }}>Action</th>
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
                                                {(() => {
                                                    const statusDisplay = getTransactionStatusDisplay(t);
                                                    return (
                                                        <>
                                                <td>
                                                    <div className="text-nowrap" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{formatDate(t.createdAt)}</div>
                                                    <small className="text-muted d-none d-sm-block">{new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                                </td>
                                                <td>
                                                    <div className="fw-bold" style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)' }}>{t.jobId?.title || 'N/A'}</div>
                                                    <small className="text-muted d-md-none">{t.employerId?.companyName || 'N/A'}</small>
                                                </td>
                                                <td className="d-none d-md-table-cell">{t.employerId?.companyName || 'N/A'}</td>
                                                <td className="d-none d-lg-table-cell"><code className="text-primary" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)' }}>{t.paymentId}</code></td>
                                                <td>
                                                    <span className="fw-bold">₹{t.paymentAmount ?? 129}</span>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{...statusDisplay.style, padding: '10px 16px', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.5px', minWidth: '80px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1}}>
                                                        {statusDisplay.label}
                                                    </span>
                                                </td>
                                                <td className="text-center align-middle">
                                                    <div className="twm-table-controls d-flex justify-content-center">
                                                        <ul className="twm-DT-controls-icon list-unstyled">
                                                            <li>
                                                                <button 
                                                                    title="View Details" 
                                                                     onClick={() => handleViewInvoice(t)}
                                                                      style={{
                                                                           display: "flex",
                                                                          alignItems: "center",
                                                                          justifyContent: "center"
                                                                       }}
                                    
                                                                >
                                                                    <span className="fa fa-eye" />
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                                        </>
                                                    );
                                                })()}
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
                    height: '100%',
                    overflowY: 'auto'
                }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" style={{ margin: 'clamp(0.5rem, 2vw, 1.75rem) auto', maxWidth: 'calc(100% - 1rem)' }}>
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-light" style={{ padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem)' }}>
                                <h5 className="modal-title d-flex align-items-center gap-2" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                                    <Receipt size={20} className="text-primary" />
                                    Transaction Receipt
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
                                {fetchingDetails ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status"></div>
                                        <p className="mt-2 text-muted">Fetching Razorpay details...</p>
                                    </div>
                                ) : (
                                    <div id="invoice-content" style={{ padding: 'clamp(0.5rem, 2vw, 1rem)' }}>
                                        <div className="d-flex flex-column flex-md-row justify-content-between mb-3 mb-md-4 align-items-start border-bottom pb-3 pb-md-4 gap-3">
                                            <div style={{ flex: '1 1 auto' }}>
                                                <img src={publicUrlFor('images/logo-dark.png')} alt="TaleGlobal Logo" style={{ height: 'clamp(30px, 8vw, 45px)', marginBottom: 'clamp(10px, 3vw, 15px)' }} />
                                                <div className="text-muted" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                                                    <p className="mb-1 fw-bold text-dark">TALEGLOBAL PLATFORM</p>
                                                    <p className="mb-1">Whitefield, Bengaluru, Karnataka 560066</p>
                                                    <p className="mb-1"><strong>GSTIN:</strong> 29ABCFG9123F1Z</p>
                                                    <p className="mb-0"><strong>Support:</strong> help@taleglobal.com</p>
                                                </div>
                                            </div>
                                            <div className="text-start text-md-end" style={{ flex: '1 1 auto' }}>
                                                <h3 className="mb-2 text-primary fw-bold" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.75rem)' }}>PAYMENT RECEIPT</h3>
                                                <div className="text-muted" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                                                    <p className="mb-1"><strong>Receipt No:</strong> {getReceiptNumber(selectedTransaction, transactions.findIndex((t) => t?._id === selectedTransaction?._id))}</p>
                                                    <p className="mb-1"><strong>Date:</strong> {formatDate(selectedTransaction?.createdAt)}</p>
                                                    <p className="mb-0">
                                                        <strong>Status:</strong>{' '}
                                                        {(() => {
                                                            const receiptStatus = getTransactionStatusDisplay(selectedTransaction);
                                                            return (
                                                                <span className="badge" style={{...receiptStatus.style, padding: '6px 12px', borderRadius: '999px', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.3px'}}>
                                                                    {receiptStatus.label}
                                                                </span>
                                                            );
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row mb-3 mb-md-5">
                                            <div className="col-12 col-md-6 mb-3 mb-md-0">
                                                <p className="text-muted mb-2 fw-bold text-uppercase border-bottom pb-1" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>Billed To (Candidate)</p>
                                                <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)' }}>{selectedTransaction?.candidateId?.name || candidateInfo?.name}</h6>
                                                <p className="text-muted mb-1" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}><i className="fa fa-envelope me-1"></i> {selectedTransaction?.candidateId?.email || candidateInfo?.email}</p>
                                                {(selectedTransaction?.candidateId?.phone || candidateInfo?.phone) && (
                                                    <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}><i className="fa fa-phone me-1"></i> {selectedTransaction?.candidateId?.phone || candidateInfo?.phone}</p>
                                                )}
                                            </div>
                                            <div className="col-12 col-md-6 text-start text-md-end">
                                                <p className="text-muted mb-2 fw-bold text-uppercase border-bottom pb-1" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>Payment Info</p>
                                                <div className="payment-info" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                                                    <div className="d-flex justify-content-end mb-1 payment-info-row">
                                                        <span className="text-muted payment-info-label" style={{ minWidth: '100px' }}>Method:</span>
                                                        <span className="text-dark fw-bold ms-2 payment-info-value">{getPaymentMethodInfo(paymentDetails)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-end mb-1 payment-info-row">
                                                        <div className="d-flex flex-column payment-info-value">
                                                            <span className="text-muted payment-info-label">Transaction ID:</span>
                                                            <span className="text-dark fw-bold">
                                                                {selectedTransaction?.paymentId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-end mb-0 payment-info-row">
                                                        <span className="text-muted payment-info-label" style={{ minWidth: '100px' }}>Order ID:</span>
                                                        <span className="text-dark fw-bold ms-2 payment-info-value">{selectedTransaction?.orderId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive mb-3 mb-md-4" style={{ overflowX: 'auto' }}>
                                            <table className="table table-bordered align-middle receipt-table" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', minWidth: '500px' }}>
                                                <thead className="receipt-table-head text-uppercase" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
                                                    <tr>
                                                        <th style={{ minWidth: '200px' }}>Description</th>
                                                        <th className="text-center">Qty</th>
                                                        <th className="text-end">Rate</th>
                                                        <th className="text-end">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="receipt-item-row">
                                                        <td>
                                                            <div className="fw-bold text-dark">Job Application Fee</div>
                                                            <div className="text-muted mt-1" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
                                                                <strong>Description:</strong> Payment for submitting this job application.<br />
                                                                <strong>Position:</strong> {selectedTransaction?.jobId?.title}<br />
                                                                <strong>Employer:</strong> {selectedTransaction?.employerId?.companyName}<br />
                                                                {selectedTransaction?.jobId?.jobCategory && (
                                                                    <span><strong>Category:</strong> {selectedTransaction?.jobId?.jobCategory}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-center">1</td>
                                                        <td className="text-end">Application Fee</td>
                                                        <td className="text-end fw-bold">Rs. {getReceiptAmountBreakdown(selectedTransaction?.paymentAmount || 129).taxableValue.toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                                <tfoot className="receipt-table-foot">
                                                    <tr>
                                                        <th colSpan="3" className="text-end text-uppercase" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>CGST (9%)</th>
                                                        <th className="text-end fw-bold" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Rs. {getReceiptAmountBreakdown(selectedTransaction?.paymentAmount || 129).cgst.toFixed(2)}</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className="text-end text-uppercase" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>SGST (9%)</th>
                                                        <th className="text-end fw-bold" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>Rs. {getReceiptAmountBreakdown(selectedTransaction?.paymentAmount || 129).sgst.toFixed(2)}</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="3" className="text-end text-uppercase" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Total Amount Paid</th>
                                                        <th className="text-end text-primary fw-bold" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>Rs. {getReceiptAmountBreakdown(selectedTransaction?.paymentAmount || 129).totalPaid.toFixed(2)}</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <div className="p-2 p-md-3 rounded border bg-light mb-3 mb-md-4">
                                            <p className="mb-0 text-muted" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
                                                <strong>Note:</strong> This is a computer-generated document and does not require a physical signature. Thank you for using TaleGlobal.
                                            </p>
                                        </div>

                                        <div className="row mt-3 mt-md-5">
                                            <div className="col-12 text-start text-md-end d-flex flex-column align-items-start align-items-md-end justify-content-end">
                                                <div style={{ width: '200px', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
                                                    <p className="mb-0 fw-bold text-dark" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Authorized Signatory</p>
                                                    <p className="mb-0 text-muted" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>TaleGlobal Platform</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="invoice-footer d-none d-print-block mt-5 pt-3 border-top text-center text-muted" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)' }}>
                                            <p className="mb-1">© {new Date().getFullYear()} TaleGlobal Platform. All rights reserved.</p>
                                            <p className="mb-0">www.taleglobal.com | Whitefield, Bengaluru, Karnataka 560066</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer bg-light" style={{ padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem)', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)} style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Close</button>
                                <button type="button" className="btn btn-primary d-flex align-items-center gap-2 receipt-print-btn" onClick={handlePrintReceipt} style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                                    <Download size={16} /> <span className="d-none d-sm-inline">Print Receipt</span><span className="d-inline d-sm-none">Print</span>
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

export default CanTransactionsPage;
