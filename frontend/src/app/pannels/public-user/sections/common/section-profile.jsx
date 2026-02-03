function SectionProfile({ employer }) {
    const iconStyle = {
        color: '#ff6b35',
        fontSize: '16px',
        marginRight: '10px'
    };

    return (
        <>
            <style>{`
                .twm-s-info-inner {
                    display: flex !important;
                    align-items: flex-start !important;
                    margin-bottom: 15px !important;
                    background: transparent !important;
                }
                .twm-s-info-inner i {
                    color: #ff6b35 !important;
                    font-size: 16px !important;
                    margin-right: 10px !important;
                    margin-top: 2px !important;
                    min-width: 20px !important;
                }
                .twm-s-info {
                    background: transparent !important;
                }
                .emp-detail .container {
                    background: transparent !important;
                }
            `}</style>
            <h4 className="section-head-small mb-4" style={{fontWeight: 'bold', fontSize: '22px'}}>Profile Info</h4>
            <div className="twm-s-info">
                <ul>
                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-building" style={iconStyle}></i>
                            <div>
                                <span className="twm-title">Company Type</span>
                                <div className="twm-s-info-discription">{(employer?.industrySector || employer?.companyType || 'Not specified').toUpperCase()}</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-calendar-alt" style={iconStyle}></i>
                            <div>
                                <span className="twm-title">Established Year</span>
                                <div className="twm-s-info-discription">{employer?.establishedSince || 'Not specified'}</div>
                            </div>
                        </div>
                    </li>

                    {/* <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-venus-mars" />
                            <span className="twm-title">Gender</span>
                            <div className="twm-s-info-discription">Male</div>
                        </div>
                    </li> */}

                    {false && (
                        <>
                            <li>
                                <div className="twm-s-info-inner">
                                    <i className="fas fa-phone" style={iconStyle}></i>
                                    <div>
                                        <span className="twm-title">Official Mobile Number</span>
                                        <div className="twm-s-info-discription">{employer?.officialMobile || employer?.phone || 'Not specified'}</div>
                                    </div>
                                </div>
                            </li>

                            <li>
                                <div className="twm-s-info-inner">
                                    <i className="fas fa-envelope" style={iconStyle}></i>
                                    <div>
                                        <span className="twm-title">Official Email ID</span>
                                        <div className="twm-s-info-discription">{employer?.officialEmail || employer?.email || 'Not specified'}</div>
                                    </div>
                                </div>
                            </li>
                        </>
                    )}

                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-users" style={iconStyle}></i>
                            <div>
                                <span className="twm-title">Company Size</span>
                                <div className="twm-s-info-discription">{employer?.teamSize || 'Not specified'}</div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-map-marker" style={iconStyle}></i>
                            <div>
                                <span className="twm-title">Corporate Office Addres</span>
                                <div className="twm-s-info-discription">{employer?.corporateAddress || 'Not specified'}</div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default SectionProfile;
