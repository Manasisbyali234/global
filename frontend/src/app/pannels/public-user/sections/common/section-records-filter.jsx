
function SectionRecordsFilter({ _config, onSortChange, onItemsPerPageChange, establishedYears = [] }) {
    const handleSortChange = (e) => {
        if (onSortChange) {
            onSortChange(e.target.value);
        }
    };

    const handleItemsPerPageChange = (e) => {
        if (onItemsPerPageChange) {
            const value = parseInt(e.target.value);
            onItemsPerPageChange(value);
        }
    };

    const isEmployerPage = _config.type === 'employers';

    return (
        <>
            <div className="product-filter-wrap d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                <span className="woocommerce-result-count-left">
                    {
                        _config.prefix
                    }
                    {
                        _config.showRange ? (` ${_config.rangeStart}-${_config.rangeEnd} of `) : " "
                    }
                    {
                        _config.total + " " + _config.type
                    }
                </span>
                <form className="woocommerce-ordering twm-filter-select d-flex align-items-center gap-3" method="get" style={{ marginLeft: "auto" }}>
                    <span className="woocommerce-result-count" style={{background: 'transparent', backgroundColor: 'transparent'}}>Sort By</span>
                    <select className="wt-select-bar-2 form-select" onChange={handleSortChange} style={{ width: "200px", fontSize: "14px" }}>
                        {isEmployerPage ? (
                            <>
                                <option value="">Default</option>
                                <option value="companyName">Company Name A-Z</option>
                                <option value="-companyName">Company Name Z-A</option>
                                <option value="-establishedSince">Newest Companies</option>
                                <option value="establishedSince">Oldest Companies</option>
                            </>
                        ) : (
                            <>
                                <option value="Most Recent">Most Recent</option>
                                <option value="Oldest">Oldest</option>
                                <option value="Salary High to Low">Salary High to Low</option>
                                <option value="Salary Low to High">Salary Low to High</option>
                                <option value="A-Z">A-Z</option>
                                <option value="Z-A">Z-A</option>
                            </>
                        )}
                    </select>

                </form>
            </div>
        </>
    )
}

export default SectionRecordsFilter;
