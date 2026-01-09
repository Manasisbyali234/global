import React, { useState } from 'react';

function TermsConditionsPage() {
    const [activeSection, setActiveSection] = useState(null);

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <div className="page-content" style={{backgroundColor: 'oklch(98.5% 0.002 247.839)', minHeight: '100vh'}}>
            <style>
                {`
                    .terms-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: #ffffff;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    
                    .terms-header {
                        background: transparent;
                        color: #2c3e50;
                        padding: 60px 40px;
                        text-align: center;
                    }
                    
                    .terms-header h1 {
                        font-size: 3rem;
                        font-weight: 700;
                        margin: 0 0 10px 0;
                    }
                    
                    .terms-header .subtitle {
                        font-size: 1.1rem;
                        opacity: 0.95;
                    }
                    
                    .terms-content {
                        padding: 40px;
                    }
                    
                    .last-updated {
                        background: #f8f9fa;
                        border-left: 4px solid #6c757d;
                        padding: 15px 20px;
                        margin-bottom: 30px;
                        border-radius: 0 8px 8px 0;
                        font-weight: 600;
                        color: #495057;
                    }
                    
                    .about-section {
                        margin-bottom: 40px;
                    }
                    
                    .about-section h2 {
                        color: #2c3e50;
                        font-size: 1.8rem;
                        font-weight: 700;
                        margin-bottom: 20px;
                        border-bottom: 3px solid #6c757d;
                        padding-bottom: 10px;
                    }
                    
                    .about-section p {
                        color: #2c3e50;
                        line-height: 1.8;
                        margin-bottom: 15px;
                        font-size: 1.05rem;
                        text-align: justify;
                    }
                    
                    .accordion-section {
                        margin-bottom: 20px;
                        border: 2px solid #e0e0e0;
                        border-radius: 10px;
                        overflow: hidden;
                        transition: all 0.3s ease;
                    }
                    
                    .accordion-section.active {
                        border-color: #6c757d;
                        box-shadow: 0 4px 12px rgba(108, 117, 125, 0.15);
                    }
                    
                    .accordion-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px 25px;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        transition: all 0.3s ease;
                    }
                    
                    .accordion-section.active .accordion-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        color: #2c3e50;
                    }
                    
                    .accordion-header h3 {
                        margin: 0;
                        font-size: 1.4rem;
                        font-weight: 700;
                        color: #2c3e50;
                    }
                    
                    .accordion-section.active .accordion-header h3 {
                        color: #2c3e50;
                    }
                    
                    .accordion-icon {
                        font-size: 1.5rem;
                        font-weight: bold;
                        transition: transform 0.3s ease;
                        color: #6c757d;
                    }
                    
                    .accordion-section.active .accordion-icon {
                        transform: rotate(180deg);
                        color: #6c757d;
                    }
                    
                    .accordion-content {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.4s ease;
                        background: white;
                    }
                    
                    .accordion-section.active .accordion-content {
                        max-height: 5000px;
                    }
                    
                    .accordion-body {
                        padding: 30px 25px;
                    }
                    
                    .subsection-title {
                        color: #495057;
                        font-weight: 700;
                        font-size: 1.2rem;
                        margin: 25px 0 15px 0;
                        padding-left: 15px;
                        border-left: 3px solid #6c757d;
                    }
                    
                    .accordion-body ul {
                        margin: 15px 0;
                        padding-left: 20px;
                        list-style: none;
                    }
                    
                    .accordion-body li {
                        color: #2c3e50;
                        line-height: 1.7;
                        margin-bottom: 12px;
                        padding-left: 0;
                        font-size: 1rem;
                        text-align: justify;
                    }
                    
                    .accordion-body p {
                        color: #2c3e50;
                        line-height: 1.8;
                        margin-bottom: 15px;
                        font-size: 1rem;
                        text-align: justify;
                    }
                    
                    .accordion-body strong {
                        color: #2c3e50;
                        font-weight: 700;
                    }
                    
                    .accordion-body em {
                        color: #495057;
                        font-style: italic;
                        font-weight: 600;
                    }
                    
                    @media (max-width: 768px) {
                        .terms-header {
                            padding: 40px 20px;
                        }
                        
                        .terms-header h1 {
                            font-size: 2rem;
                        }
                        
                        .terms-content {
                            padding: 20px;
                        }
                        
                        .accordion-header h3 {
                            font-size: 1.1rem;
                        }
                        
                        .accordion-body {
                            padding: 20px 15px;
                        }
                    }
                `}
            </style>
            
            <div className="container">
                <div className="section-full p-t120 p-b90">
                    <div className="terms-container">
                        <div className="terms-header">
                            <h1>Terms & Conditions</h1>
                            <div className="subtitle">Legal Framework & User Guidelines</div>
                        </div>
                        
                        <div className="terms-content">
                            <div className="last-updated">
                                <strong>Last Updated:</strong> November 2025
                            </div>
                            
                            <div className="about-section">
                                <h2>About TaleGlobal</h2>
                                <p>TaleGlobal is an innovative employment and recruitment platform designed to transform the way job seekers and employers connect across India. The platform eliminates the outdated practice of candidates traveling for interviews, enabling them to attend interviews conveniently from anywhere.</p>
                                
                                <p>TaleGlobal functions solely as a <strong>digital intermediary</strong> under the <em>Information Technology Act, 2000</em>, facilitating interaction between verified employers, candidates, consultancies, and educational institutions. The platform operates in accordance with applicable laws including the <em>Digital Personal Data Protection Act, 2023</em>.</p>
                                
                                <p>Through its technology-driven, transparent, and ethically managed system, TaleGlobal aims to redefine recruitment in India fostering trust, reducing time, and creating a streamlined experience for all stakeholders.</p>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'candidate' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('candidate')}>
                                    <h3>Terms & Conditions for Candidates</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Registration and Profile Creation</h4>
                                        <ul>
                                            <li>Candidates must register using accurate, complete, and verifiable personal, educational, and professional details.</li>
                                            <li>All profiles, resumes, and supporting information submitted must be truthful. Misrepresentation may result in immediate disqualification and permanent suspension.</li>
                                            <li>Registration constitutes a valid electronic agreement under Section 10A of the <em>Information Technology Act, 2000</em>.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Application and Fees</h4>
                                        <ul>
                                            <li>TaleGlobal operates on a <strong>pay-per-application system</strong>, where a nominal, non-refundable processing fee is charged per job application.</li>
                                            <li>The fee maintains platform functionality, verification, and digital-interview infrastructure and is not a fee for employment or placement services.</li>
                                            <li>Once payment is made, no refund shall be permitted under any circumstances.</li>
                                            <li>Candidates are responsible for ensuring stable internet access and device readiness during online interviews.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Conduct</h4>
                                        <ul>
                                            <li>Candidates must maintain professional etiquette, punctuality, and decorum throughout all recruitment stages.</li>
                                            <li>Use of abusive language, impersonation, unauthorized recording, or sharing of interview content is strictly prohibited.</li>
                                            <li>Any misuse of the platform may result in immediate termination of access without refund.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Data and Privacy</h4>
                                        <ul>
                                            <li>Candidate data shall be shared only with verified employers, consultancies, or institutions for legitimate recruitment purposes.</li>
                                            <li>TaleGlobal complies with the <em>Digital Personal Data Protection Act, 2023</em> to ensure confidentiality and secure storage of personal data.</li>
                                            <li>Candidates retain rights of access, correction, and erasure of their personal data in accordance with applicable privacy laws.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Liability</h4>
                                        <ul>
                                            <li>TaleGlobal acts solely as an online intermediary and does not guarantee interviews, employment, or offer letters.</li>
                                            <li>TaleGlobal shall not be liable for any act, omission, or representation made by employers, consultancies, or placement officers.</li>
                                            <li>TaleGlobal's aggregate liability shall not exceed the total fee paid by the candidate for the specific application.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'employer' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('employer')}>
                                    <h3>Terms & Conditions for Employers</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Registration and Verification</h4>
                                        <ul>
                                            <li>Employers must complete the mandatory TaleGlobal verification process prior to posting any job openings.</li>
                                            <li>Verification includes submission of valid business registration certificates, GSTIN, PAN, and other business identity proofs.</li>
                                            <li>TaleGlobal reserves the right to seek additional documents or conduct background checks to ensure authenticity.</li>
                                            <li>Only verified employers shall be permitted to post job listings on the platform.</li>
                                            <li>Registration constitutes a valid and binding electronic agreement under Section 10A of the <em>Information Technology Act, 2000</em>.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Job Posting and Process</h4>
                                        <ul>
                                            <li>Each job listing must accurately specify the job title, eligibility criteria, remuneration, interview schedule, and selection process.</li>
                                            <li>Employers must declare the expected timeline for issuing offer letters and adhere to the same.</li>
                                            <li>Job postings shall be genuine, lawful, and compliant with employment and labour regulations.</li>
                                            <li>TaleGlobal reserves the right to moderate, suspend, or remove any job listing that is false, misleading, or discriminatory.</li>
                                            <li>Employers acknowledge that TaleGlobal functions solely as an intermediary platform and bears no responsibility for employment contracts.</li>
                                            <li>Posting of fraudulent job listings shall attract immediate suspension and may invite legal proceedings.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Ethical Conduct</h4>
                                        <ul>
                                            <li>Employers must maintain professional standards in all interactions with candidates.</li>
                                            <li>Discriminatory practices based on gender, religion, caste, or any other protected characteristic are strictly prohibited.</li>
                                            <li>Employers must respond to applications in a timely manner and maintain transparency throughout the recruitment process.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Data Privacy</h4>
                                        <ul>
                                            <li>Employers agree to use candidate information solely for recruitment purposes.</li>
                                            <li>Misuse of candidate data is strictly prohibited and may result in account suspension and legal action.</li>
                                            <li>Employers must comply with all applicable data protection laws and regulations.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'consultancy' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('consultancy')}>
                                    <h3>Terms & Conditions for Consultancies</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Registration and Verification</h4>
                                        <ul>
                                            <li>Consultancies must complete the TaleGlobal verification process before posting or managing job listings.</li>
                                            <li>Verification requires submission of valid business-registration documents, GSTIN, PAN, and employer-authorization letter.</li>
                                            <li>TaleGlobal reserves the right to request additional documents or conduct background checks.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Job Posting</h4>
                                        <ul>
                                            <li>Consultancies shall post job openings only on behalf of <strong>verified employers</strong> with proper authorization.</li>
                                            <li>All job postings must be genuine, accurate, and compliant with applicable labour and recruitment laws.</li>
                                            <li>Any duplicate, misleading, or fictitious listing is strictly prohibited.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Ethical Conduct</h4>
                                        <ul>
                                            <li>Consultancies shall not demand, solicit, or collect any payment from candidates under any circumstance.</li>
                                            <li>Sale, transfer, or disclosure of candidate data to third parties for commercial gain is strictly prohibited.</li>
                                            <li>Any act of impersonation or false representation shall result in immediate termination and may attract legal action.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Data Privacy and Protection</h4>
                                        <ul>
                                            <li>Consultancies shall use candidate data strictly for legitimate recruitment purposes.</li>
                                            <li>All consultancies must comply with the <em>Digital Personal Data Protection Act, 2023</em>.</li>
                                            <li>Consultancies must implement appropriate measures to protect personal data and notify TaleGlobal of any data breach.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'placement' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('placement')}>
                                    <h3>Terms & Conditions for Placement Officers</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Registration and Verification</h4>
                                        <ul>
                                            <li>Placement Officers must provide valid institutional credentials and official contact information.</li>
                                            <li>Your account will be verified before activation to ensure authenticity.</li>
                                            <li>Registration constitutes a legally binding electronic agreement under applicable laws.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Student Data Management</h4>
                                        <ul>
                                            <li>You are responsible for the accuracy of student data uploaded to the platform.</li>
                                            <li>Student information must be uploaded with proper consent from students and the institution.</li>
                                            <li>All data must comply with UGC and AICTE guidelines governing campus placements.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Credit Allocation</h4>
                                        <ul>
                                            <li>Credits allocated to students are managed by your institution.</li>
                                            <li>You are responsible for fair distribution of credits among students.</li>
                                            <li>Credit usage and allocation must be transparent and documented.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Data Privacy</h4>
                                        <ul>
                                            <li>You must comply with data protection regulations when handling student information.</li>
                                            <li>Student data should only be used for placement purposes.</li>
                                            <li>Unauthorized sharing or commercial use of student data is strictly prohibited.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'legal' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('legal')}>
                                    <h3>Legal Compliance and Jurisdiction</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <p>All users of TaleGlobal agree to comply with all applicable laws, regulations, and guidelines in force in India, including but not limited to:</p>
                                        <ul>
                                            <li><em>Information Technology Act, 2000</em> and related rules</li>
                                            <li><em>Digital Personal Data Protection Act, 2023</em></li>
                                            <li><em>Indian Contract Act, 1872</em></li>
                                            <li><em>Right to Privacy</em> as enshrined under <em>Article 21 of the Constitution of India</em></li>
                                            <li>Applicable <em>Employment, Labour, and Anti-Discrimination Laws</em> of India</li>
                                            <li><em>UGC</em> and <em>AICTE</em> Guidelines governing campus placements</li>
                                        </ul>
                                        
                                        <p>TaleGlobal operates solely as a digital intermediary and shall not be deemed to create any employment, partnership, or agency relationship with any user.</p>
                                        
                                        <p>Any dispute arising out of or in connection with these Terms shall be governed exclusively by the laws of India. The courts at <strong>Bengaluru, Karnataka</strong>, shall have <strong>exclusive jurisdiction</strong> to adjudicate all such disputes.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'disclaimer' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('disclaimer')}>
                                    <h3>Disclaimer & Limitation of Liability</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">No Employment Guarantee</h4>
                                        <ul>
                                            <li>TaleGlobal does not guarantee employment, selection, job placement, or any hiring outcome.</li>
                                            <li>The platform only provides digital infrastructure for interaction between users.</li>
                                            <li>All employment-related decisions are made independently by employers.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Accuracy of Information</h4>
                                        <ul>
                                            <li>All job listings and user information are uploaded directly by users.</li>
                                            <li>While TaleGlobal undertakes reasonable verification, it does not independently verify all content.</li>
                                            <li>Users are encouraged to conduct their own due diligence.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Limitation of Liability</h4>
                                        <p><strong>TaleGlobal shall not be held liable for:</strong></p>
                                        <ul>
                                            <li>Any hiring decisions, rejections, delayed offers, or job cancellations</li>
                                            <li>Any loss or deletion of data resulting from user negligence</li>
                                            <li>Any consequential, indirect, emotional, reputational, or financial loss</li>
                                            <li>Any unauthorized access or data breach caused by circumstances beyond reasonable control</li>
                                        </ul>
                                        
                                        <p>The aggregate liability of TaleGlobal shall not exceed the <strong>total fee paid by the user</strong> for the specific service giving rise to such claim.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TermsConditionsPage;
