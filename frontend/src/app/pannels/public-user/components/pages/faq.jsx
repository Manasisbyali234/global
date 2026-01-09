import SectionFaqGeneral from "../../sections/faq/section-faq-general";
import SectionFaqJobs from "../../sections/faq/section-faq-jobs";
import SectionFaqPayments from "../../sections/faq/section-faq-payment";
import SectionFaqReturn from "../../sections/faq/section-faq-return";

function FaqPage() {
    return (
        <>
            <div className="section-full p-t120  p-b90 site-bg-white">
                <div className="container">
                    <div className="section-content">
                        <div className="twm-tabs-style-1 center">
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#General" type="button" role="tab">General</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#Jobs" type="button" role="tab" aria-controls="Jobs">Jobs</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#Payment" type="button" role="tab" aria-controls="Payment">Payment</button>
                                </li>
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#Return" type="button" role="tab" aria-controls="Return">Return</button>
                                </li>
                            </ul>
                            <div className="tab-content" id="myTabContent">
                                {/*Tabs content one*/}
                                <div className="tab-pane fade show active" id="General" role="tabpanel">
                                    <SectionFaqGeneral />
                                </div>
                                {/*Tabs content two*/}
                                <div className="tab-pane fade" id="Jobs" role="tabpanel">
                                    <SectionFaqJobs />
                                </div>
                                {/*Tabs content three*/}
                                <div className="tab-pane fade" id="Payment" role="tabpanel">
                                    <SectionFaqPayments />
                                </div>
                                {/*Tabs content Four*/}
                                <div className="tab-pane fade" id="Return" role="tabpanel">
                                    <SectionFaqReturn />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default FaqPage;
