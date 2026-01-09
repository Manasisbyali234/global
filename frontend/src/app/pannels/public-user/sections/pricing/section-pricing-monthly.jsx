import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";

function SectionPricingMonthly() {
    return (
        <>
            <div className="pricing-block-outer">
                <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-6 m-b30">
                        <div className="pricing-table-1">
                            <div className="p-table-title">
                                <h4 className="wt-title">
                                    Basic
                                </h4>
                            </div>
                            <div className="p-table-inner">
                                <div className="p-table-price">
                                    <span>$90/</span>
                                    <p>Monthly</p>
                                </div>
                                <div className="p-table-list">
                                    <ul>
                                        <li><i className="feather-check" />1 job posting</li>
                                        <li className="disable"><i className="feather-x" />0 featured job</li>
                                        <li className="disable"><i className="feather-x" />job displayed fo 20 days</li>
                                        <li className="disable"><i className="feather-x" />Premium support 24/7</li>
                                    </ul>
                                </div>
                                <div className="p-table-btn">
                                    <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 p-table-highlight m-b30">
                        <div className="pricing-table-1 circle-yellow">
                            <div className="p-table-recommended">Recommended</div>
                            <div className="p-table-title">
                                <h4 className="wt-title">
                                    Standard
                                </h4>
                            </div>
                            <div className="p-table-inner">
                                <div className="p-table-price">
                                    <span>$248/</span>
                                    <p>Monthly</p>
                                </div>
                                <div className="p-table-list">
                                    <ul>
                                        <li><i className="feather-check" />1 job posting</li>
                                        <li><i className="feather-check" />0 featured job</li>
                                        <li><i className="feather-check" />job displayed fo 20 days</li>
                                        <li className="disable"><i className="feather-x" />Premium support 24/7</li>
                                    </ul>
                                </div>
                                <div className="p-table-btn">
                                    <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 m-b30">
                        <div className="pricing-table-1 circle-pink">
                            <div className="p-table-title">
                                <h4 className="wt-title">
                                    Extended
                                </h4>
                            </div>
                            <div className="p-table-inner">
                                <div className="p-table-price">
                                    <span>$499/</span>
                                    <p>Monthly</p>
                                </div>
                                <div className="p-table-list">
                                    <ul>
                                        <li><i className="feather-check" />1 job posting</li>
                                        <li><i className="feather-check" />0 featured job</li>
                                        <li><i className="feather-check" />job displayed fo 20 days</li>
                                        <li><i className="feather-check" />Premium support 24/7</li>
                                    </ul>
                                </div>
                                <div className="p-table-btn">
                                    <NavLink to={publicUser.pages.ABOUT} className="site-button">Purchase Now</NavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SectionPricingMonthly;
