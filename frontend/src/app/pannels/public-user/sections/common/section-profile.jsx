function SectionProfile({ employer }) {
    return (
        <>
            <h4 className="section-head-small mb-4" style={{fontWeight: 'bold', fontSize: '22px'}}>Profile Info</h4>
            <div className="twm-s-info">
                <ul>
                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-money-bill-wave" />
                            <span className="twm-title">Company Type</span>
                            <div className="twm-s-info-discription">{(employer?.industrySector || employer?.companyType || 'Not specified').toUpperCase()}</div>
                        </div>
                    </li>

                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-clock" />
                            <span className="twm-title">Established Year</span>
                            <div className="twm-s-info-discription">{employer?.establishedSince || 'Not specified'}</div>
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
                                    <i className="fas fa-mobile-alt" />
                                    <span className="twm-title">Official Mobile Number</span>
                                    <div className="twm-s-info-discription">{employer?.officialMobile || employer?.phone || 'Not specified'}</div>
                                </div>
                            </li>

                            <li>
                                <div className="twm-s-info-inner">
                                    <i className="fas fa-at" />
                                    <span className="twm-title">Official Email ID</span>
                                    <div className="twm-s-info-discription">{employer?.officialEmail || employer?.email || 'Not specified'}</div>
                                </div>
                            </li>
                        </>
                    )}

                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-book-reader" />
                            <span className="twm-title">Company Size</span>
                            <div className="twm-s-info-discription">{employer?.teamSize || 'Not specified'}</div>
                        </div>
                    </li>

                    <li>
                        <div className="twm-s-info-inner">
                            <i className="fas fa-map-marker-alt" />
                            <span className="twm-title">Corporate Office Addres</span>
                            <div className="twm-s-info-discription">{employer?.corporateAddress || 'Not specified'}</div>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default SectionProfile;
