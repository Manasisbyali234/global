import React, { useState, useEffect } from 'react';
import "../../../../../overlay-mobile-fix.css";

function TermsConditionsPage() {
    const [activeSection, setActiveSection] = useState(null);

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    useEffect(() => {
        const handleScroll = () => {
            const hamburgerMenu = document.querySelector('.navbar-collapse.show');
            const hamburgerToggler = document.querySelector('.navbar-toggler');
            if (hamburgerMenu) {
                hamburgerMenu.classList.remove('show');
            }
            if (hamburgerToggler && !hamburgerToggler.classList.contains('collapsed')) {
                hamburgerToggler.classList.add('collapsed');
                hamburgerToggler.setAttribute('aria-expanded', 'false');
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="page-content" style={{backgroundColor: 'oklch(98.5% 0.002 247.839)', minHeight: '100vh', marginTop: '40px'}}>
            <style>
                {`
                    @media (max-width: 991px) {
                        .section-full { padding-top: 5px !important; padding-bottom: 5px !important; }
                        .terms-container { margin-top: 0 !important; }
                        .terms-header { padding: 10px 15px !important; }
                        .terms-header h1 { font-size: 1.5rem !important; margin: 0 !important; }
                        .terms-header .subtitle { font-size: 0.9rem !important; }
                        .terms-content { padding: 15px !important; }
                    }
                    .terms-container { max-width: 1200px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border-radius: 12px; overflow: hidden; }
                    .terms-header { background: transparent; color: #2c3e50; padding: 60px 40px; text-align: center; }
                    .terms-header h1 { font-size: 3rem; font-weight: 700; margin: 0 0 10px 0; }
                    .terms-header .subtitle { font-size: 1.1rem; opacity: 0.95; }
                    .terms-content { padding: 40px; }
                    .last-updated { background: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0; font-weight: 600; color: #495057; }
                    .about-section { margin-bottom: 40px; }
                    .about-section h2 { color: #2c3e50; font-size: 1.8rem; font-weight: 700; margin-bottom: 20px; border-bottom: 3px solid #6c757d; padding-bottom: 10px; }
                    .about-section p { color: #2c3e50; line-height: 1.8; margin-bottom: 15px; font-size: 1.05rem; text-align: justify; }
                    .accordion-section { margin-bottom: 20px; border: 2px solid #e0e0e0; border-radius: 10px; overflow: hidden; transition: all 0.3s ease; }
                    .accordion-section.active { border-color: #6c757d; box-shadow: 0 4px 12px rgba(108, 117, 125, 0.15); }
                    .accordion-header { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px 25px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; }
                    .accordion-section.active .accordion-header { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); color: #2c3e50; }
                    .accordion-header h3 { margin: 0; font-size: 1.4rem; font-weight: 700; color: #2c3e50; }
                    .accordion-icon { font-size: 1.5rem; font-weight: bold; transition: transform 0.3s ease; color: #6c757d; }
                    .accordion-section.active .accordion-icon { transform: rotate(180deg); }
                    .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; background: white; }
                    .accordion-section.active .accordion-content { max-height: 10000px; }
                    .accordion-body { padding: 30px 25px; }
                    .subsection-title { color: #495057; font-weight: 700; font-size: 1.2rem; margin: 25px 0 15px 0; padding-left: 15px; border-left: 3px solid #6c757d; }
                    .accordion-body ul { margin: 15px 0; padding-left: 20px; list-style: none; }
                    .accordion-body li { color: #2c3e50; line-height: 1.7; margin-bottom: 12px; padding-left: 0; font-size: 1rem; text-align: justify; }
                    .accordion-body p { color: #2c3e50; line-height: 1.8; margin-bottom: 15px; font-size: 1rem; text-align: justify; }
                    .accordion-body strong { color: #2c3e50; font-weight: 700; }
                    .accordion-body em { color: #495057; font-style: italic; font-weight: 600; }
                    @media (max-width: 768px) {
                        .terms-header { padding: 40px 20px; }
                        .terms-header h1 { font-size: 2rem; }
                        .terms-content { padding: 20px; }
                        .accordion-header h3 { font-size: 1.1rem; }
                        .accordion-body { padding: 20px 15px; }
                        .accordion-body strong { font-weight: normal !important; }
                        .accordion-body em { font-style: normal !important; font-weight: normal !important; }
                        .about-section strong { font-weight: normal !important; }
                        .about-section em { font-style: normal !important; font-weight: normal !important; }
                        strong { font-weight: normal !important; }
                        em { font-style: normal !important; font-weight: normal !important; }
                        .about-section p { text-align: left !important; }
                        .accordion-body p { text-align: left !important; }
                        .accordion-body li { text-align: left !important; }
                    }
                `}
            </style>
            
            <div className="container">
                <div className="section-full" style={{paddingTop: '5px', paddingBottom: '5px'}}>
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
                                <h2>ABOUT TALEGLOBAL</h2>
                                <p>TaleGlobal is an innovative employment and recruitment platform designed to transform the way job seekers and employers connect across India. The platform was established with a clear vision, to eliminate the outdated practice of candidates traveling from one place to another for interviews. TaleGlobal empowers individuals to attend interviews conveniently from wherever they are, ensuring accessibility, efficiency, and equal opportunity for all.</p>
                                
                                <p>TaleGlobal functions solely as a <strong>digital intermediary</strong> under the <em>Information Technology Act, 2000</em>, facilitating interaction between verified employers, candidates, consultancies, and educational institutions. The platform does not itself participate in recruitment, selection, or execution of employment contracts. It operates in accordance with the <em>Information Technology Act, 2000</em>, <em>Indian Contract Act, 1872</em>, and the <em>Digital Personal Data Protection Act, 2023</em>, ensuring lawful processing, storage, and sharing of user data.</p>
                                
                                <p>TaleGlobal serves as a transparent and trusted bridge between employers, candidates, consultancies, and educational institutions. The platform enables companies to post verified job opportunities free of cost while providing candidates with access to relevant positions that match their skills, qualifications, and aspirations.</p>
                                
                                <p>Each job posting on TaleGlobal includes clearly defined recruitment stages, interview schedules, and offer letter release timelines. This structure ensures accountability and transparency throughout the hiring process, helping both employers and job seekers plan efficiently and make informed decisions.</p>
                                
                                <p>TaleGlobal performs reasonable verification of employer credentials through business registration and tax-identification checks to prevent fraudulent listings. However, TaleGlobal does not guarantee the authenticity of job descriptions, remuneration details, or offers made by employers. The responsibility for candidate document verification and employment due diligence lies solely with the hiring organization.</p>
                                
                                <p>For candidates, the platform operates on a <strong>pay-per-application model</strong>, requiring a nominal, non-refundable processing fee toward maintenance of the platform's technological and verification services. Such payment does not constitute a consideration for employment or a guarantee of placement.</p>
                                
                                <p>In addition to serving job seekers and employers, TaleGlobal offers a dedicated <strong>Placement Officer Portal</strong> that allows accredited colleges and universities to upload verified student data directly. This enables final-year students and graduates to access genuine and verified job opportunities while helping employers connect with qualified fresh talent. All data shared through TaleGlobal including candidate profiles and institutional uploads is processed only for recruitment facilitation and is never sold or transferred for unrelated commercial purposes. Users retain rights of access, correction, and erasure as provided under applicable data-protection law.</p>
                                
                                <p>Through its technology-driven, transparent, and ethically managed system, TaleGlobal aims to redefine recruitment in India fostering trust, reducing time, and creating a streamlined experience for all stakeholders. The platform upholds values of <strong>integrity, fairness, inclusivity, and accountability</strong>, ensuring that every opportunity shared through TaleGlobal contributes meaningfully to India's growing professional ecosystem.</p>
                                
                                <p>All services are deemed to be provided from Karnataka, India, and any dispute arising from the use of the platform shall be subject to the exclusive jurisdiction of the competent courts at Bengaluru.</p>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'employer' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('employer')}>
                                    <h3>TERMS AND CONDITIONS FOR EMPLOYERS</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Registration and Verification</h4>
                                        <ul>
                                            <li>Employers must complete the mandatory TaleGlobal verification process prior to posting any job openings.</li>
                                            <li>Verification shall include submission of valid business registration certificates, GSTIN, PAN, and other business identity proofs as may be required under the <em>Information Technology Act, 2000</em> and applicable labour and tax laws.</li>
                                            <li>TaleGlobal reserves the right to seek additional documents or conduct background checks to ensure authenticity.</li>
                                            <li>Only verified employers shall be permitted to post job listings on the platform. TaleGlobal may suspend or cancel access if verification information is found to be false, incomplete, or misleading.</li>
                                            <li>The act of registration constitutes a valid and binding electronic agreement under Section 10A of the <em>Information Technology Act, 2000</em>, confirming the employer's acceptance of these Terms and Conditions.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Job Posting and Process</h4>
                                        <ul>
                                            <li>Each job listing must accurately specify the job title, eligibility criteria, remuneration or compensation (if applicable), interview schedule, and selection process.</li>
                                            <li>Employers must declare the expected timeline for issuing offer letters and adhere to the same to maintain process transparency.</li>
                                            <li>Job postings shall be genuine, lawful, and compliant with employment and labour regulations, including those relating to equal opportunity and non-discrimination.</li>
                                            <li>TaleGlobal reserves the right to moderate, suspend, or remove any job listing that is false, misleading, discriminatory, or otherwise violates these Terms or any applicable law.</li>
                                            <li>Employers acknowledge that TaleGlobal functions solely as an intermediary platform and bears no responsibility for the accuracy, outcome, or fulfillment of any employment contract arising from such postings.</li>
                                            <li>Posting of fraudulent, deceptive, or unverifiable job listings shall attract immediate suspension and may invite civil or criminal proceedings under the <em>Information Technology Act, 2000</em>, <em>BNS</em>, and other applicable laws.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'candidate' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('candidate')}>
                                    <h3>TERMS AND CONDITIONS FOR CANDIDATES</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Registration and Profile Creation</h4>
                                        <ul>
                                            <li>Candidates must register using accurate, complete, and verifiable personal, educational, and professional details.</li>
                                            <li>All profiles, resumes, and supporting information submitted on the platform must be truthful. Any misrepresentation, falsification, or omission may result in immediate disqualification and permanent suspension of the account.</li>
                                            <li>By registering, candidates acknowledge that such registration constitutes a valid electronic agreement under Section 10A of the <em>Information Technology Act, 2000</em> and that they consent to the lawful processing of their data in accordance with the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em>.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Application and Fees</h4>
                                        <ul>
                                            <li>TaleGlobal operates on a <strong>pay-per-application system</strong>, where a nominal, non-refundable processing fee is charged per job application.</li>
                                            <li>The fee is collected solely to maintain platform functionality, verification, and digital-interview infrastructure and shall not be construed as a fee for employment or placement services.</li>
                                            <li>Once payment is made, no refund shall be permitted under any circumstances, regardless of interview outcome or employer decision.</li>
                                            <li>Candidates are responsible for ensuring stable internet access and device readiness during online interviews. TaleGlobal is not liable for disruptions caused by user connectivity or technical limitations.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Conduct</h4>
                                        <ul>
                                            <li>Candidates must maintain professional etiquette, punctuality, and decorum throughout all stages of the recruitment process conducted through TaleGlobal.</li>
                                            <li>Use of abusive language, impersonation, unauthorized recording, or sharing of interview content is strictly prohibited and may lead to account suspension and legal consequences under the <em>Information Technology Act, 2000</em>.</li>
                                            <li>Any misuse of the platform, attempt to manipulate results, or unethical activity shall result in immediate termination of access without refund.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Data and Privacy</h4>
                                        <ul>
                                            <li>Candidate data shall be shared only with verified employers, consultancies, or institutions registered on the TaleGlobal platform for legitimate recruitment purposes.</li>
                                            <li>TaleGlobal complies with the <em>Digital Personal Data Protection Act, 2023</em>, <em>Information Technology Act, 2000</em>, and the <em>IT (Data Protection) Rules 2011</em> to ensure confidentiality, lawful processing, and secure storage of personal data.</li>
                                            <li>Candidates retain rights of access, correction, and erasure of their personal data in accordance with applicable privacy laws and may contact the designated Grievance Officer for any related concerns.</li>
                                            <li>TaleGlobal employs encryption, access-control, and monitoring mechanisms to safeguard personal information but shall not be responsible for unauthorized disclosures arising from user negligence.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Liability</h4>
                                        <ul>
                                            <li>TaleGlobal acts solely as an online intermediary connecting candidates with verified employers and does not guarantee interviews, employment, or offer letters.</li>
                                            <li>TaleGlobal shall not be liable for any act, omission, or representation made by employers, consultancies, or placement officers, nor for any loss financial, professional, or reputational arising from platform usage.</li>
                                            <li>In no event shall TaleGlobal's aggregate liability exceed the total fee paid by the candidate for the specific application that gave rise to such claim.</li>
                                            <li>Nothing in this clause shall limit liability arising from willful misconduct, fraud, or statutory violations.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'consultancy' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('consultancy')}>
                                    <h3>TERMS AND CONDITIONS FOR CONSULTANCIES</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Registration and Verification</h4>
                                        <ul>
                                            <li>Consultancies must complete the TaleGlobal verification process before being permitted to post, manage, or represent job listings on the platform.</li>
                                            <li>Verification requires submission of valid business-registration documents, GSTIN, PAN, and an employer-authorization letter confirming the consultancy's lawful engagement with the represented employer.</li>
                                            <li>TaleGlobal reserves the right to request additional documents, conduct background checks, or suspend access if submitted information is found to be false, incomplete, or misleading.</li>
                                            <li>Registration and continued use of the platform constitute a legally binding electronic agreement under Section 10A of the <em>Information Technology Act, 2000</em>.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Job Posting</h4>
                                        <ul>
                                            <li>Consultancies shall post job openings only on behalf of <strong>verified employers</strong> and strictly in accordance with the authorization issued to them.</li>
                                            <li>All job postings must be genuine, accurate, and compliant with applicable labour, recruitment, and anti-discrimination laws.</li>
                                            <li>Any duplicate, misleading, or fictitious listing is strictly prohibited and shall lead to immediate suspension or blacklisting.</li>
                                            <li>Consultancies acknowledge that TaleGlobal operates solely as a digital intermediary and is not a party to any employment, service, or recruitment contract arising from such postings.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Ethical Conduct</h4>
                                        <ul>
                                            <li>Consultancies shall not, directly or indirectly, demand, solicit, or collect any payment, commission, or benefit from candidates under any circumstance.</li>
                                            <li>Sale, transfer, or disclosure of candidate data to third parties for commercial gain is strictly prohibited.</li>
                                            <li>Any act of impersonation, false representation of employer authorization, or unethical conduct shall result in immediate termination of the consultancy's account and may attract legal action under the <em>Information Technology Act, 2000</em> and <em>Indian Penal Code, 1860</em>.</li>
                                            <li>Consultancies must maintain professionalism and ensure that their representatives communicate transparently and respectfully with both employers and candidates.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Data Privacy and Protection</h4>
                                        <ul>
                                            <li>Consultancies shall use candidate data strictly for legitimate recruitment purposes and only in relation to the specific job openings authorized by the employer.</li>
                                            <li>All consultancies must comply with the <em>Digital Personal Data Protection Act, 2023</em>, <em>Information Technology Act, 2000</em>, and the <em>IT (Data Protection) Rules, 2011</em>.</li>
                                            <li>Consultancies shall implement appropriate technical and organizational measures to protect personal data and shall immediately notify TaleGlobal of any data breach or unauthorized disclosure.</li>
                                            <li>Unauthorized access, transfer, or misuse of data may lead to permanent blacklisting, termination of access, and potential civil or criminal liability.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Liability</h4>
                                        <ul>
                                            <li>Consultancies are fully responsible for the accuracy, completeness, and legitimacy of all job postings, employer details, and related communications handled through their accounts.</li>
                                            <li>TaleGlobal shall not be liable for any dispute, misrepresentation, or contractual disagreement arising between consultancies, employers, or candidates.</li>
                                            <li>Consultancies agree to <strong>indemnify and hold TaleGlobal harmless</strong> against any loss, claim, or proceeding arising from (a) breach of these Terms, (b) unauthorized use of candidate data, or (c) any misrepresentation made to employers or candidates.</li>
                                            <li>TaleGlobal's aggregate liability, if any, shall be limited to the verified consultancy's total service fee paid for the period in question.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'payment' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('payment')}>
                                    <h3>Payment Terms & Conditions</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <h4 className="subsection-title">Service Fee</h4>
                                        <p>A one-time, non-refundable service fee of ₹129 (Rupees Ninety-Nine only) is charged for accessing the platform features/services.</p>
                                        
                                        <h4 className="subsection-title">No Refund Policy</h4>
                                        <p>All payments are final and non-refundable. After successful processing, no refunds, cancellations, or chargebacks are permitted. No refunds will be issued regardless of interview outcome or employer decision. Candidates are responsible for their internet access and device readiness. TaleGlobal is not liable for these issues.</p>
                                        
                                        <h4 className="subsection-title">Payment Confirmation</h4>
                                        <p>Upon successful payment, users will receive confirmation via the platform and/or registered email. Access to the paid features will be enabled immediately.</p>
                                        
                                        <h4 className="subsection-title">Failed or Duplicate Payments</h4>
                                        <p>In case of a failed transaction where the amount is debited but the service is not activated, users may contact customer support with valid payment proof for resolution.</p>
                                        
                                        <h4 className="subsection-title">Pricing Changes</h4>
                                        <p>The platform reserves the right to modify the pricing at any time without prior notice. Any changes will not affect payments already completed.</p>
                                        
                                        <h4 className="subsection-title">Unauthorized Transactions</h4>
                                        <p>Users are responsible for ensuring the accuracy of payment details. The platform is not liable for payments made due to user error or unauthorized access to user accounts.</p>
                                        
                                        <h4 className="subsection-title">Agreement to Terms</h4>
                                        <p>By proceeding with the payment, users acknowledge that they have read, understood, and agreed to these payment terms and conditions, including the no-refund policy.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'legal' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('legal')}>
                                    <h3>LEGAL COMPLIANCE AND JURISDICTION</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <p>All users of TaleGlobal including employers, candidates, consultancies, and placement officers agree to comply with all applicable laws, regulations, and guidelines in force in India, including but not limited to:</p>
                                        <ul>
                                            <li><em>Information Technology Act, 2000</em> and the <em>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</em></li>
                                            <li><em>Digital Personal Data Protection Act, 2023</em></li>
                                            <li><em>Indian Contract Act, 1872</em></li>
                                            <li><em>Right to Privacy</em> as enshrined under <em>Article 21 of the Constitution of India</em></li>
                                            <li>Applicable <em>Employment, Labour, and Anti-Discrimination Laws</em> of India</li>
                                            <li><em>UGC</em> and <em>AICTE</em> Guidelines governing campus placements and institutional data management</li>
                                        </ul>
                                        
                                        <p>Users further agree to ensure that all activities carried out through TaleGlobal, including recruitment, data sharing, and communication, are lawful, ethical, and consistent with the principles of integrity, transparency, and non-discrimination.</p>
                                        
                                        <p>TaleGlobal operates solely as a digital intermediary within the meaning of Section 2(1)(w) of the <em>Information Technology Act, 2000</em> and shall not be deemed to create any employment, partnership, or agency relationship with any user.</p>
                                        
                                        <p>Any dispute, claim, or controversy arising out of or in connection with these Terms, the Privacy Policy, or use of the platform shall be governed exclusively by the laws of India.</p>
                                        
                                        <p>The parties agree that the courts at <strong>Bengaluru, Karnataka</strong>, shall have <strong>exclusive jurisdiction</strong> to adjudicate all such disputes, without prejudice to TaleGlobal's right to seek equitable relief in other competent forums where necessary to protect its intellectual property, data, or reputation.</p>
                                        
                                        <p>Users expressly waive any objection to the jurisdiction or venue of such courts on grounds of inconvenience or otherwise.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'modifications' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('modifications')}>
                                    <h3>MODIFICATIONS AND ACCEPTANCE</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <ul>
                                            <li>TaleGlobal reserves the right to revise, amend, or update these Terms and Conditions, the Privacy Policy, or any associated documents at any time to reflect changes in law, technology, or business practice.</li>
                                            <li>All revisions shall be published on the official TaleGlobal website and shall take effect immediately upon such publication unless otherwise specified. Users are advised to review the Terms periodically to stay informed of any updates.</li>
                                            <li>Continued access to or use of the platform after the publication of amended Terms shall constitute the user's acknowledgment and acceptance of those changes and shall form a binding electronic agreement under Section 10A of the <em>Information Technology Act, 2000</em>.</li>
                                            <li>In the event that a user does not agree to the revised Terms or Privacy Policy, they must immediately cease use of the platform and notify TaleGlobal in writing to close their account.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'privacy' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('privacy')}>
                                    <h3>TALEGLOBAL PRIVACY POLICY</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <p>TaleGlobal is committed to protecting the privacy, security, and lawful use of personal information entrusted to it by all individuals using its website and services including employers, candidates, consultancies, and placement officers. This Privacy Policy outlines how TaleGlobal collects, processes, uses, stores, discloses, and protects personal information in accordance with the <em>Digital Personal Data Protection Act, 2023</em>, the <em>Information Technology Act, 2000</em>, and other applicable laws of India.</p>
                                        
                                        <p>By creating an account, accessing, or using the TaleGlobal platform, you expressly acknowledge that you have read, understood, and agree to be bound by this Privacy Policy and consent to the collection and use of your personal data as set out herein. Your consent constitutes a valid and enforceable electronic consent under the <em>Information Technology Act, 2000</em>.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'disclaimer' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('disclaimer')}>
                                    <h3>TALEGLOBAL DISCLAIMER</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <p>TaleGlobal functions solely as a <strong>digital recruitment intermediary</strong> connecting verified employers, consultancies, placement officers, and candidates. The platform facilitates lawful interaction and communication among registered users but does not participate in, influence, or guarantee the outcome of any recruitment or employment process. TaleGlobal operates in compliance with the <em>Information Technology Act, 2000</em> and qualifies as an <strong>intermediary</strong> under Section 2(1)(w) thereof.</p>
                                        
                                        <h4 className="subsection-title">No Employment Guarantee</h4>
                                        <ul>
                                            <li>TaleGlobal does not guarantee employment, selection, job placement, or any hiring outcome.</li>
                                            <li>The platform only provides digital infrastructure that enables interaction between candidates, employers, consultancies, and placement officers based on information voluntarily provided by such users.</li>
                                            <li>All employment-related decisions, including interviews, assessments, and offers, are made independently by employers or their authorized representatives.</li>
                                            <li>TaleGlobal shall not be responsible for the non-selection of candidates, cancellation of job openings, or modification of recruitment schedules by employers.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">Accuracy of Information</h4>
                                        <ul>
                                            <li>All job listings, company information, candidate profiles, and consultancy details displayed on the TaleGlobal platform are uploaded or entered directly by users.</li>
                                            <li>While TaleGlobal undertakes reasonable verification of employer credentials to prevent fraudulent postings, it does not independently verify or endorse the content, accuracy, or legality of each job posting, interview schedule, remuneration structure, or offer letter.</li>
                                            <li>TaleGlobal expressly disclaims any liability for errors, omissions, misrepresentations, or false declarations made by users.</li>
                                            <li>Users are encouraged to conduct their own due diligence before entering into any employment or service agreement facilitated through the platform.</li>
                                        </ul>
                                        
                                        <h4 className="subsection-title">User Responsibility</h4>
                                        <ul>
                                            <li><strong>Employers</strong> are solely responsible for conducting interviews, verifying candidate credentials, making selection decisions, and issuing offer letters in compliance with applicable labour and employment laws.</li>
                                            <li><strong>Candidates</strong> are responsible for ensuring the accuracy and completeness of their personal data, resumes, and other submitted information, as well as maintaining proper internet connectivity and device readiness during online interactions.</li>
                                            <li><strong>Consultancies</strong> and <strong>Placement Officers</strong> are accountable for ensuring the authenticity of data uploaded to the platform, including verification of employer authorization and student consent.</li>
                                            <li>Users agree to use the platform only for lawful purposes and shall indemnify TaleGlobal against any claim, loss, or damage resulting from misuse, negligence, or breach of these obligations.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'liability' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('liability')}>
                                    <h3>LIMITATION OF LIABILITY</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <p>TaleGlobal functions solely as a technology-based intermediary facilitating communication between verified employers, candidates, consultancies, and placement officers. Under no circumstance shall TaleGlobal be deemed to have participated in or influenced any hiring decision, employment contract, or commercial arrangement between users.</p>
                                        
                                        <p><strong>TaleGlobal shall not be held liable for:</strong></p>
                                        <ul>
                                            <li>Any hiring decisions, rejections, delayed offers, job cancellations, or failure to receive responses from employers</li>
                                            <li>Any loss, alteration, or deletion of data resulting from user negligence, incorrect input, or misuse of the platform</li>
                                            <li>Any consequential, indirect, emotional, reputational, or financial loss arising out of or in connection with the use of the platform or reliance on its contents</li>
                                            <li>Any unauthorized access, data breach, or disclosure caused by circumstances beyond TaleGlobal's reasonable control, including cyberattacks or force majeure events</li>
                                        </ul>
                                        
                                        <p>TaleGlobal provides all services on an "as is" and "as available" basis, without any express or implied warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
                                        
                                        <p>The aggregate liability of TaleGlobal, its officers, employees, or affiliates, whether arising in contract, tort, negligence, or otherwise, shall not exceed the <strong>total fee paid by the user</strong> for the specific service giving rise to such claim.</p>
                                        
                                        <p>Nothing contained herein shall exclude or limit liability for willful misconduct, gross negligence, or statutory violations under applicable Indian law.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`accordion-section ${activeSection === 'governing' ? 'active' : ''}`}>
                                <div className="accordion-header" onClick={() => toggleSection('governing')}>
                                    <h3>LEGAL VALIDITY AND GOVERNING LAW</h3>
                                    <span className="accordion-icon">▼</span>
                                </div>
                                <div className="accordion-content">
                                    <div className="accordion-body">
                                        <ul>
                                            <li>This Disclaimer and all related Terms and Conditions shall be governed by and construed in accordance with the laws of India.</li>
                                            <li>Users agree that any dispute, claim, or controversy arising from or relating to the use of the TaleGlobal platform, these Terms, or this Disclaimer shall be subject to the <strong>exclusive jurisdiction of the competent courts at Bengaluru, Karnataka, India</strong>.</li>
                                            <li>The invalidity or unenforceability of any provision of this Disclaimer shall not affect the validity of the remaining provisions, which shall remain in full force and effect.</li>
                                            <li>This Disclaimer constitutes an integral part of TaleGlobal's Terms and Conditions and shall be read harmoniously with them for the purpose of interpretation and enforcement.</li>
                                        </ul>
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
