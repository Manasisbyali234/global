import { useState, useEffect } from 'react';

function SectionPagination({ currentPage = 1, totalPages = 1, onPageChange }) {
    const [page, setPage] = useState(currentPage);

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            if (onPageChange) {
                onPageChange(newPage);
            }
        }
    };

    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
            range.push(i);
        }

        if (page - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (page + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="pagination-outer">
            <div className="pagination-style1">
                <ul className="clearfix">
                    <li className={`prev ${page === 1 ? 'disabled' : ''}`}>
                        <button 
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="btn"
                        >
                            <span><i className="fa fa-angle-left" /></span>
                        </button>
                    </li>
                    
                    {getVisiblePages().map((pageNum, index) => (
                        <li key={index} className={pageNum === page ? 'active' : ''}>
                            {pageNum === '...' ? (
                                <span>...</span>
                            ) : (
                                <button 
                                    onClick={() => handlePageChange(pageNum)}
                                    className="btn"
                                >
                                    {pageNum}
                                </button>
                            )}
                        </li>
                    ))}
                    
                    <li className={`next ${page === totalPages ? 'disabled' : ''}`}>
                        <button 
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="btn"
                        >
                            <span><i className="fa fa-angle-right" /></span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default SectionPagination;
