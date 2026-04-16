import { useEffect, useState, useMemo } from "react";
import { formatDate } from '../../../../utils/dateFormatter';
import { createPortal } from "react-dom";
import { loadScript, publicUrlFor } from "../../../../globals/constants";
import { Search, IndianRupee, Download, Eye } from "lucide-react";
import { api } from "../../../../utils/api";
import "../../../../styles/print-receipt.css";

function AdminTransactionsPage() {
    const currencySymbol = '\u20B9';
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [companySearch, setCompanySearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
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
        const cq = companySearch.trim().toLowerCase();
        const from = fromDate ? new Date(new Date(fromDate).toDateString()) : null;
        const to = toDate ? new Date(new Date(toDate).toDateString()) : null;
        return transactions.filter((t) => {
            if (t.paymentCurrency === 'CREDITS' || t.paymentId?.startsWith('credit_')) return false;
            const candidateName = t.candidateId?.name?.toLowerCase() || "";
            const candidateEmail = t.candidateId?.email?.toLowerCase() || "";
            const companyName = t.employerId?.companyName?.toLowerCase() || "";
            if (from || to) {
                const txDate = t.createdAt ? new Date(new Date(t.createdAt).toDateString()) : null;
                if (!txDate) return false;
                if (from && txDate < from) return false;
                if (to && txDate > to) return false;
            }
            return (candidateName.includes(q) || candidateEmail.includes(q)) && companyName.includes(cq);
        });
    }, [transactions, searchText, companySearch, fromDate, toDate]);

    const exportToExcel = () => {
        const headers = ['Date', 'Time', 'Candidate Name', 'Candidate Email', 'Company', 'Company Email', 'Job Role', 'Payment ID', 'Amount (INR)'];
        const rows = filteredTransactions.map((t) => [
            formatDate(t.createdAt),
            new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            t.candidateId?.name || 'N/A',
            t.candidateId?.email || 'N/A',
            t.employerId?.companyName || 'N/A',
            t.employerId?.email || 'N/A',
            t.jobId?.title || 'N/A',
            t.paymentId || 'N/A',
            t.paymentAmount || 129
        ]);
        const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getReceiptAmountBreakdown = (amount) => {
        const totalPaid = Number(amount ?? 129);
        const roundTo2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
        const taxableValue = roundTo2(totalPaid / 1.18);
        const cgst = roundTo2(taxableValue * 0.09);
        const sgst = roundTo2(totalPaid - taxableValue - cgst);
        return { totalPaid, taxableValue, cgst, sgst };
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
            <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
                <div className="wt-admin-right-page-header clearfix d-flex justify-content-between align-items-center" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem 2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <div>
                        <h2 className="m-0">All Transactions</h2>
                        <p className="text-muted m-0 mt-1">Monitor all platform payments from candidates</p>
                    </div>
                    <button
                        className="btn btn-success d-flex align-items-center gap-2"
                        onClick={exportToExcel}
                        title="Export to Excel"
                    >
                        <Download size={16} /> Export to Excel
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
                <div className="panel panel-default site-bg-white p-4" style={{ background: 'white', borderRadius: '12px', border: '1px solid #eef2f7', boxShadow: 'none', margin: 0 }}>
                    
                    <div className="page-toolbar mb-4">
                        <div className="page-toolbar__controls page-toolbar__controls--single">
                        <div className="page-toolbar__section">
                            <label className="page-toolbar__label">
                                Search Transactions 
                            </label>
                        <div className="page-toolbar__control-wrap">
                            <input
                                type="text"
                                className="form-control page-toolbar__input"
                                placeholder="Search by candidate email or name..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{
                                    paddingLeft: '42px',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: '14px center',
                                    backgroundSize: '16px 16px'
                                }}
                            />
                        </div>
                        </div>
                        </div>
                        <div className="page-toolbar__section">
                            <label className="page-toolbar__label">Search by Company</label>
                            <div className="page-toolbar__control-wrap">
                                <input
                                    type="text"
                                    className="form-control page-toolbar__input"
                                    placeholder="Search by company name..."
                                    value={companySearch}
                                    onChange={(e) => setCompanySearch(e.target.value)}
                                    style={{
                                        paddingLeft: '42px',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='7' width='20' height='14' rx='2'/%3E%3Cpath d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: '14px center',
                                        backgroundSize: '16px 16px'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="page-toolbar__section">
                            <label className="page-toolbar__label">From Date</label>
                            <div className="page-toolbar__control-wrap">
                                <input
                                    type="date"
                                    className="form-control page-toolbar__input"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    style={{ width: '150px' }}
                                />
                            </div>
                        </div>
                        <div className="page-toolbar__section">
                            <label className="page-toolbar__label">To Date</label>
                            <div className="page-toolbar__control-wrap">
                                <input
                                    type="date"
                                    className="form-control page-toolbar__input"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    style={{ width: '150px' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-muted mt-2">
                        Total Platform Revenue: <strong>{currencySymbol}{(transactions.filter(t => t.paymentCurrency !== 'CREDITS' && !t.paymentId?.startsWith('credit_')).reduce((acc, t) => acc + (t.paymentAmount || 129), 0)).toLocaleString()}</strong>
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
                                                    <div className="text-nowrap">{formatDate(t.createdAt)}</div>
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
                                                    <span className="fw-bold">{currencySymbol}{t.paymentAmount || 129}</span>
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
                    display: 'grid',
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    zIndex: 2147483647,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    minHeight: '100vh',
                    overflow: 'hidden',
                    placeItems: 'center',
                    padding: '0.5rem'
                }}>
                    <div
                        className="modal-dialog"
                        style={{
                            margin: 0,
                            width: 'min(820px, 90vw)',
                            maxWidth: 'min(820px, 90vw)',
                            minWidth: 'min(820px, 90vw)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div className="modal-content border-0 shadow-lg" style={{ width: '100%', maxWidth: '100%', maxHeight: 'calc(100vh - 1rem)' }}>
                            <div className="modal-header bg-light">
                                <h5 className="modal-title d-flex align-items-center gap-2">
                                    <IndianRupee size={20} className="text-primary" />
                                    Platform Transaction Receipt
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                            </div>
                            <div className="modal-body p-4" style={{ overflowY: 'auto' }}>
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
                                                    <p className="mb-1 fw-bold text-dark"></p>
                                                    <p className="mb-1">Whitefield, Bengaluru, Karnataka 560066</p>
                                                    <p className="mb-1"><strong>GSTIN:</strong> 29ABCFG9123F1Z</p>
                                                    <p className="mb-0"><strong>Email:</strong> finance@taleglobal.com</p>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <div className="receipt-meta-block">
                                                    <h3 className="mb-2 text-primary fw-bold">TAX INVOICE</h3>
                                                    <div className="text-muted small receipt-info-list receipt-meta">
                                                        <div className="receipt-info-row">
                                                            <span className="receipt-info-label">Receipt No</span>
                                                            <span className="receipt-info-separator">:</span>
                                                            <span className="receipt-info-value">{getReceiptNumber(selectedTransaction, transactions.findIndex((t) => t?._id === selectedTransaction?._id))}</span>
                                                        </div>
                                                        <div className="receipt-info-row">
                                                            <span className="receipt-info-label">Date</span>
                                                            <span className="receipt-info-separator">:</span>
                                                            <span className="receipt-info-value">{formatDate(selectedTransaction?.createdAt)}</span>
                                                        </div>
                                                        <div className="receipt-info-row">
                                                            <span className="receipt-info-label">Status</span>
                                                            <span className="receipt-info-separator">:</span>
                                                            <span className="receipt-info-value">
                                                                <span className="badge bg-success text-uppercase">Paid</span>
                                                            </span>
                                                        </div>
                                                    </div>
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
                                                <p className="text-muted small mb-2 fw-bold text-uppercase border-bottom pb-1 receipt-info-heading">Payment Information</p>
                                                <div className="small receipt-info-list payment-info">
                                                    <div className="receipt-info-row payment-info-row payment-method-row">
                                                        <span className="receipt-info-label payment-info-label">Method</span>
                                                        <span className="receipt-info-separator">:</span>
                                                        <span className="receipt-info-value payment-info-value payment-method-value">{getPaymentMethodInfo(paymentDetails)}</span>
                                                    </div>
                                                    <div className="receipt-info-row payment-info-row">
                                                        <span className="receipt-info-label payment-info-label">Transaction ID</span>
                                                        <span className="receipt-info-separator">:</span>
                                                        <span className="receipt-info-value payment-info-value">{selectedTransaction?.paymentId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive mb-4">
                                            <table className="table table-bordered align-middle">
                                                <thead className="table-light text-uppercase small">
                                                    <tr>
                                                        <th style={{ width: '60%' }}>Service Description</th>
                                                        <th className="text-end">Rate</th>
                                                        <th className="text-end">Subtotal</th>
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
                                                        <td className="text-end">Application Fee</td>
                                                        <td className="text-end fw-bold">{currencySymbol}{getReceiptAmountBreakdown(selectedTransaction?.paymentAmount).taxableValue.toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                                <tfoot className="table-light">
                                                    <tr>
                                                        <th colSpan="2" className="text-end small text-uppercase">CGST (9%)</th>
                                                        <th className="text-end">{currencySymbol}{getReceiptAmountBreakdown(selectedTransaction?.paymentAmount).cgst.toFixed(2)}</th>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan="2" className="text-end small text-uppercase">SGST (9%)</th>
                                                        <th className="text-end">{currencySymbol}{getReceiptAmountBreakdown(selectedTransaction?.paymentAmount).sgst.toFixed(2)}</th>
                                                    </tr>
                                                    <tr className="border-top border-primary border-2">
                                                        <th colSpan="2" className="text-end text-primary fw-bold text-uppercase">Grand Total</th>
                                                        <th className="text-end text-primary fw-bold fs-5">{currencySymbol}{getReceiptAmountBreakdown(selectedTransaction?.paymentAmount).totalPaid.toFixed(2)}</th>
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
                                                        <li>• For support, please contact help@taleglobal.net with your Transaction ID.</li>
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
                                <button type="button" className="btn btn-primary d-flex align-items-center gap-2 receipt-print-btn" onClick={handlePrintReceipt}>
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
