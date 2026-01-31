import SectionEmployerInfo from "../../sections/employers/detail/section-emp-info";
import SectionEmployersCandidateSidebar from "../../sections/common/section-emp-can-sidebar";
import SectionOfficeVideo1 from "../../sections/common/section-office-video1";
import SectionOfficePhotos3 from "../../sections/common/section-office-photos3";
import SectionAvailableJobsGrid from "../../sections/employers/detail/section-available-jobs-grid";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadScript } from "../../../../../globals/constants";

function EmployersDetail2Page() {
    const { id } = useParams();
    const [employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        loadScript("js/custom.js")
        if (id) {
            fetchEmployerDetails();
        }
    }, [id]);

    const fetchEmployerDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/public/employers/${id}`);
            const data = await response.json();
            if (data.success) {
                setEmployer(data.profile);
            }
        } catch (error) {
            console.error('Error fetching employer details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (!employer) return <div className="error-container">Employer not found</div>;

    return (
        <>
            <div className="section-full  p-t0 p-b90 bg-white">
                {/*Top Wide banner Start*/}
                <SectionEmployerInfo employer={employer} />
                {/*Top Wide banner End*/}
                <div className="container">
                    <div className="section-content">
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-4 col-md-12 rightSidebar">
                                <SectionEmployersCandidateSidebar type="2" employer={employer} />
                            </div>
                            <div className="col-lg-8 col-md-12">
                                {/* Candidate detail START */}
                                <div className="cabdidate-de-info">
                                    <h4 className="twm-s-title m-t0">About Company</h4>
                                    <div dangerouslySetInnerHTML={{
                                        __html: (employer.employerId?.employerType === 'consultant' && employer.companyDescription) 
                                            ? employer.companyDescription 
                                            : (employer.description || 'No company description available.')
                                    }} />
                                    
                                    {employer.whyJoinUs && (
                                        <>
                                            <h4 className="twm-s-title">Why Join Us</h4>
                                            <div dangerouslySetInnerHTML={{ __html: employer.whyJoinUs }} />
                                        </>
                                    )}

                                    <div className="twm-two-part-section">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 m-b30">
                                                <SectionOfficeVideo1 videoUrl={employer.googleMapsEmbed} />
                                            </div>
                                            <div className="col-lg-12 col-md-12">
                                                <SectionOfficePhotos3 gallery={employer.gallery} />
                                            </div>
                                        </div>
                                    </div>
                                    <SectionAvailableJobsGrid employerId={id} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EmployersDetail2Page;
