import React from 'react';
import { useEffect } from "react";
import { loadScript } from "../../../../../globals/constants";

function AboutUsPage() {

    useEffect(() => {
        loadScript("js/custom.js");
    })

    return (
        <div className="page-content" style={{backgroundColor: 'oklch(98.5% 0.002 247.839)', minHeight: '100vh', paddingLeft: '20px', paddingRight: '20px'}}>
            <style>
                {`
                    .privacy-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: #ffffff;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    
                    .privacy-header {
                        background: transparent;
                        color: #2c3e50;
                        padding: 60px 40px;
                        text-align: center;
                        position: relative;
                    }
                    
                    .privacy-header h1 {
                        font-size: 3.2rem;
                        font-weight: 700;
                        margin: 0 0 15px 0;
                        position: relative;
                        z-index: 2;
                    }
                    
                    .privacy-header .subtitle {
                        font-size: 1.2rem;
                        opacity: 0.95;
                        position: relative;
                        z-index: 2;
                        font-weight: 400;
                    }
                    
                    .privacy-content {
                        padding: 50px 40px;
                        background: #ffffff;
                    }
                    
                    .last-updated {
                        background: #f8f9fa;
                        border-left: 4px solid #fd7e14;
                        padding: 20px 25px;
                        margin-bottom: 40px;
                        border-radius: 0 8px 8px 0;
                        font-weight: 600;
                        color: #495057;
                    }
                    
                    .section-title {
                        color: #2c3e50 !important;
                        font-weight: 700 !important;
                        font-size: 1.5rem !important;
                        margin: 40px 0 20px 0 !important;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #fd7e14;
                        position: relative;
                    }
                    
                    .section-title:first-of-type {
                        margin-top: 0 !important;
                    }
                    
                    .privacy-content p {
                        color: #2c3e50;
                        line-height: 1.8;
                        margin-bottom: 20px;
                        font-size: 1.05rem;
                        text-align: justify;
                    }
                    
                    .privacy-content ul {
                        margin: 25px 0;
                        padding-left: 0;
                    }
                    
                    .privacy-content li {
                        color: #2c3e50;
                        line-height: 1.7;
                        margin-bottom: 15px;
                        padding-left: 30px;
                        position: relative;
                        font-size: 1.05rem;
                        text-align: justify;
                    }
                    
                    .privacy-content strong {
                        color: #2c3e50;
                        font-weight: 700;
                    }
                    
                    @media (max-width: 768px) {
                        .privacy-header {
                            padding: 40px 20px;
                        }
                        
                        .privacy-header h1 {
                            font-size: 2.5rem;
                        }
                        
                        .privacy-content {
                            padding: 30px 20px;
                        }
                        
                        .section-title {
                            font-size: 1.3rem !important;
                        }
                    }
                `}
            </style>
            
            <div className="section-full py-3" style={{paddingLeft: '20px', paddingRight: '20px'}}>
                    <div className="privacy-container">
                        <div className="privacy-header">
                            <h1>About TaleGlobal</h1>
                            <div className="subtitle">Transforming Employment & Recruitment in India</div>
                        </div>
                        
                        <div className="privacy-content">
                            <h3 className="section-title">Who We Are</h3>
                            <p>TaleGlobal is an innovative employment and recruitment platform designed to transform the way job seekers and employers connect across India. The platform was established with a clear vision, to eliminate the outdated practice of candidates traveling from one place to another for interviews. TaleGlobal empowers individuals to attend interviews conveniently from wherever they are, ensuring accessibility, efficiency, and equal opportunity for all.</p>

                            <h3 className="section-title">Legal Framework</h3>
                            <p>TaleGlobal functions solely as a digital intermediary under the Information Technology Act, 2000, facilitating interaction between verified employers, candidates, consultancies, and educational institutions. The platform does not itself participate in recruitment, selection, or execution of employment contracts. It operates in accordance with the Information Technology Act, 2000, Indian Contract Act, 1872, and the Digital Personal Data Protection Act, 2023, ensuring lawful processing, storage, and sharing of user data.</p>

                            <h3 className="section-title">Our Mission</h3>
                            <p>TaleGlobal serves as a transparent and trusted bridge between employers, candidates, consultancies, and educational institutions. The platform enables companies to post verified job opportunities free of cost while providing candidates with access to relevant positions that match their skills, qualifications, and aspirations.</p>

                            <h3 className="section-title">Transparency & Accountability</h3>
                            <p>Each job posting on TaleGlobal includes clearly defined recruitment stages, interview schedules, and offer letter release timelines. This structure ensures accountability and transparency throughout the hiring process, helping both employers and job seekers plan efficiently and make informed decisions.</p>

                            <h3 className="section-title">Employer Verification</h3>
                            <p>TaleGlobal performs reasonable verification of employer credentials through business registration and tax-identification checks to prevent fraudulent listings. However, TaleGlobal does not guarantee the authenticity of job descriptions, remuneration details, or offers made by employers. The responsibility for candidate document verification and employment due diligence lies solely with the hiring organization.</p>

                            <h3 className="section-title">For Candidates</h3>
                            <p>For candidates, the platform operates on a pay-per-application model, requiring a nominal, non-refundable processing fee toward maintenance of the platform's technological and verification services. Such payment does not constitute a consideration for employment or a guarantee of placement.</p>

                            <h3 className="section-title">Placement Dean Portal</h3>
                            <p>In addition to serving job seekers and employers, TaleGlobal offers a dedicated Placement Dean Portal that allows accredited colleges and universities to upload verified student data directly. This enables final-year students and graduates to access genuine and verified job opportunities while helping employers connect with qualified fresh talent. All data shared through TaleGlobal including candidate profiles and institutional uploads is processed only for recruitment facilitation and is never sold or transferred for unrelated commercial purposes. Users retain rights of access, correction, and erasure as provided under applicable data-protection law.</p>

                            <h3 className="section-title">Our Values</h3>
                            <p>Through its technology-driven, transparent, and ethically managed system, TaleGlobal aims to redefine recruitment in India fostering trust, reducing time, and creating a streamlined experience for all stakeholders. The platform upholds values of integrity, fairness, inclusivity, and accountability, ensuring that every opportunity shared through TaleGlobal contributes meaningfully to India's growing professional ecosystem.</p>

                            <h3 className="section-title">Jurisdiction</h3>
                            <p>All services are deemed to be provided from Karnataka, India, and any dispute arising from the use of the platform shall be subject to the exclusive jurisdiction of the competent courts at Bengaluru.</p>
                        </div>
                    </div>
            </div>
        </div>
    );
}

export default AboutUsPage;
