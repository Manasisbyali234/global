import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './TermsModal.css';
import { disableBodyScroll, enableBodyScroll } from '../utils/scrollUtils';

const TermsModal = ({ isOpen, onClose, onAccept, role = 'candidate' }) => {
    const [hasScrolled, setHasScrolled] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHasScrolled(false);
            setAccepted(false);
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
        return () => enableBodyScroll();
    }, [isOpen]);

    const handleScroll = (e) => {
        const element = e.target;
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
        if (isAtBottom && !hasScrolled) {
            setHasScrolled(true);
        }
    };

    // Check if content is short enough to not require scrolling
    useEffect(() => {
        if (isOpen) {
            const checkScrollNeeded = () => {
                const modalBody = document.querySelector('.terms-modal-body');
                if (modalBody) {
                    const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
                    if (!isScrollable) {
                        setHasScrolled(true); // Auto-enable if no scrolling needed
                    }
                }
            };
            // Small delay to ensure DOM is rendered
            setTimeout(checkScrollNeeded, 100);
        }
    }, [isOpen]);

    const handleAccept = () => {
        if (accepted && hasScrolled) {
            onAccept();
        }
    };

    const commonLegalSections = [
        { heading: 'Legal Compliance and Jurisdiction', content: 'All users of TaleGlobal including employers, candidates, consultancies, and placement officers agree to comply with all applicable laws, regulations, and guidelines in force in India, including but not limited to: Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; Digital Personal Data Protection Act, 2023; Indian Contract Act, 1872; Right to Privacy as enshrined under Article 21 of the Constitution of India; Applicable Employment, Labour, and Anti-Discrimination Laws of India; UGC and AICTE Guidelines governing campus placements and institutional data management. Users further agree to ensure that all activities carried out through TaleGlobal, including recruitment, data sharing, and communication, are lawful, ethical, and consistent with the principles of integrity, transparency, and non-discrimination. TaleGlobal operates solely as a digital intermediary within the meaning of Section 2(1)(w) of the Information Technology Act, 2000 and shall not be deemed to create any employment, partnership, or agency relationship with any user. Any dispute, claim, or controversy arising out of or in connection with these Terms, the Privacy Policy, or use of the platform shall be governed exclusively by the laws of India. The parties agree that the courts at Bengaluru, Karnataka, shall have exclusive jurisdiction to adjudicate all such disputes, without prejudice to TaleGlobal\'s right to seek equitable relief in other competent forums where necessary to protect its intellectual property, data, or reputation. Users expressly waive any objection to the jurisdiction or venue of such courts on grounds of inconvenience or otherwise.' },
        { heading: 'Modifications and Acceptance', content: 'TaleGlobal reserves the right to revise, amend, or update these Terms and Conditions, the Privacy Policy, or any associated documents at any time to reflect changes in law, technology, or business practice. All revisions shall be published on the official TaleGlobal website and shall take effect immediately upon such publication unless otherwise specified. Users are advised to review the Terms periodically to stay informed of any updates. Continued access to or use of the platform after the publication of amended Terms shall constitute the user\'s acknowledgment and acceptance of those changes and shall form a binding electronic agreement under Section 10A of the Information Technology Act, 2000. In the event that a user does not agree to the revised Terms or Privacy Policy, they must immediately cease use of the platform and notify TaleGlobal in writing to close their account.' },
        { heading: 'TaleGlobal Privacy Policy', content: 'TaleGlobal is committed to protecting the privacy, security, and lawful use of personal information entrusted to it by all individuals using its website and services including employers, candidates, consultancies, and placement officers. This Privacy Policy outlines how TaleGlobal collects, processes, uses, stores, discloses, and protects personal information in accordance with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, and other applicable laws of India. By creating an account, accessing, or using the TaleGlobal platform, you expressly acknowledge that you have read, understood, and agree to be bound by this Privacy Policy and consent to the collection and use of your personal data as set out herein. Your consent constitutes a valid and enforceable electronic consent under the Information Technology Act, 2000.' },
        { heading: 'TaleGlobal Disclaimer', content: 'TaleGlobal functions solely as a digital recruitment intermediary connecting verified employers, consultancies, placement officers, and candidates. The platform facilitates lawful interaction and communication among registered users but does not participate in, influence, or guarantee the outcome of any recruitment or employment process. TaleGlobal operates in compliance with the Information Technology Act, 2000 and qualifies as an intermediary under Section 2(1)(w) thereof. TaleGlobal does not guarantee employment, selection, job placement, or any hiring outcome. The platform only provides digital infrastructure that enables interaction between candidates, employers, consultancies, and placement officers based on information voluntarily provided by such users. All employment-related decisions, including interviews, assessments, and offers, are made independently by employers or their authorized representatives. TaleGlobal shall not be responsible for the non-selection of candidates, cancellation of job openings, or modification of recruitment schedules by employers. All job listings, company information, candidate profiles, and consultancy details displayed on the TaleGlobal platform are uploaded or entered directly by users. While TaleGlobal undertakes reasonable verification of employer credentials to prevent fraudulent postings, it does not independently verify or endorse the content, accuracy, or legality of each job posting, interview schedule, remuneration structure, or offer letter. TaleGlobal expressly disclaims any liability for errors, omissions, misrepresentations, or false declarations made by users. Users are encouraged to conduct their own due diligence before entering into any employment or service agreement facilitated through the platform.' },
        { heading: 'Limitation of Liability', content: 'TaleGlobal functions solely as a technology-based intermediary facilitating communication between verified employers, candidates, consultancies, and placement officers. Under no circumstance shall TaleGlobal be deemed to have participated in or influenced any hiring decision, employment contract, or commercial arrangement between users. TaleGlobal shall not be held liable for: Any hiring decisions, rejections, delayed offers, job cancellations, or failure to receive responses from employers; Any loss, alteration, or deletion of data resulting from user negligence, incorrect input, or misuse of the platform; Any consequential, indirect, emotional, reputational, or financial loss arising out of or in connection with the use of the platform or reliance on its contents; Any unauthorized access, data breach, or disclosure caused by circumstances beyond TaleGlobal\'s reasonable control, including cyberattacks or force majeure events. TaleGlobal provides all services on an "as is" and "as available" basis, without any express or implied warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. The aggregate liability of TaleGlobal, its officers, employees, or affiliates, whether arising in contract, tort, negligence, or otherwise, shall not exceed the total fee paid by the user for the specific service giving rise to such claim. Nothing contained herein shall exclude or limit liability for willful misconduct, gross negligence, or statutory violations under applicable Indian law.' },
        { heading: 'Legal Validity and Governing Law', content: 'This Disclaimer and all related Terms and Conditions shall be governed by and construed in accordance with the laws of India. Users agree that any dispute, claim, or controversy arising from or relating to the use of the TaleGlobal platform, these Terms, or this Disclaimer shall be subject to the exclusive jurisdiction of the competent courts at Bengaluru, Karnataka, India. The invalidity or unenforceability of any provision of this Disclaimer shall not affect the validity of the remaining provisions, which shall remain in full force and effect. This Disclaimer constitutes an integral part of TaleGlobal\'s Terms and Conditions and shall be read harmoniously with them for the purpose of interpretation and enforcement.' }
    ];

    const termsContent = {
        candidateApplication: {
            title: 'Application and Fees',
            sections: [
                { heading: 'Application and Fees', content: 'TaleGlobal operates on a pay-per-application system, where a nominal, non-refundable processing fee is charged per job application. The fee is collected solely to maintain platform functionality, verification, and digital-interview infrastructure and shall not be construed as a fee for employment or placement services. Once payment is made, no refund shall be permitted under any circumstances, regardless of interview outcome or employer decision. Candidates are responsible for ensuring stable internet access and device readiness during online interviews. TaleGlobal is not liable for disruptions caused by user connectivity or technical limitations.' },
                ...commonLegalSections
            ]
        },
        candidate: {
            title: 'Terms & Conditions for Candidates',
            sections: [
                { heading: 'Registration and Profile Creation', content: 'Candidates must register using accurate, complete, and verifiable personal, educational, and professional details. All profiles, resumes, and supporting information submitted on the platform must be truthful. Any misrepresentation, falsification, or omission may result in immediate disqualification and permanent suspension of the account. By registering, candidates acknowledge that such registration constitutes a valid electronic agreement under Section 10A of the Information Technology Act, 2000 and that they consent to the lawful processing of their data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act).' },
                { heading: 'Application and Fees', content: 'TaleGlobal operates on a pay-per-application system, where a nominal, non-refundable processing fee is charged per job application. The fee is collected solely to maintain platform functionality, verification, and digital-interview infrastructure and shall not be construed as a fee for employment or placement services. Once payment is made, no refund shall be permitted under any circumstances, regardless of interview outcome or employer decision. Candidates are responsible for ensuring stable internet access and device readiness during online interviews. TaleGlobal is not liable for disruptions caused by user connectivity or technical limitations.' },
                { heading: 'Conduct', content: 'Candidates must maintain professional etiquette, punctuality, and decorum throughout all stages of the recruitment process conducted through TaleGlobal. Use of abusive language, impersonation, unauthorized recording, or sharing of interview content is strictly prohibited and may lead to account suspension and legal consequences under the Information Technology Act, 2000. Any misuse of the platform, attempt to manipulate results, or unethical activity shall result in immediate termination of access without refund.' },
                { heading: 'Data and Privacy', content: 'Candidate data shall be shared only with verified employers, consultancies, or institutions registered on the TaleGlobal platform for legitimate recruitment purposes. TaleGlobal complies with the Digital Personal Data Protection Act, 2023, Information Technology Act, 2000, and the IT (Data Protection) Rules 2011 to ensure confidentiality, lawful processing, and secure storage of personal data. Candidates retain rights of access, correction, and erasure of their personal data in accordance with applicable privacy laws and may contact the designated Grievance Officer for any related concerns.' },
                { heading: 'Liability', content: 'TaleGlobal acts solely as an online intermediary connecting candidates with verified employers and does not guarantee interviews, employment, or offer letters. TaleGlobal shall not be liable for any act, omission, or representation made by employers, consultancies, or placement officers, nor for any loss financial, professional, or reputational arising from platform usage. In no event shall TaleGlobal\'s aggregate liability exceed the total fee paid by the candidate for the specific application that gave rise to such claim.' },
                ...commonLegalSections
            ]
        },
        candidateProfile: {
            title: 'Terms & Conditions for Candidates',
            sections: [
                { heading: 'Registration and Profile Creation', content: 'Candidates must register using accurate, complete, and verifiable personal, educational, and professional details. All profiles, resumes, and supporting information submitted on the platform must be truthful. Any misrepresentation, falsification, or omission may result in immediate disqualification and permanent suspension of the account. By registering, candidates acknowledge that such registration constitutes a valid electronic agreement under Section 10A of the Information Technology Act, 2000 and that they consent to the lawful processing of their data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act).' },
                { heading: 'Application and Fees', content: 'TaleGlobal operates on a pay-per-application system, where a nominal, non-refundable processing fee is charged per job application. The fee is collected solely to maintain platform functionality, verification, and digital-interview infrastructure and shall not be construed as a fee for employment or placement services. Once payment is made, no refund shall be permitted under any circumstances, regardless of interview outcome or employer decision. Candidates are responsible for ensuring stable internet access and device readiness during online interviews. TaleGlobal is not liable for disruptions caused by user connectivity or technical limitations.' },
                { heading: 'Conduct', content: 'Candidates must maintain professional etiquette, punctuality, and decorum throughout all stages of the recruitment process conducted through TaleGlobal. Use of abusive language, impersonation, unauthorized recording, or sharing of interview content is strictly prohibited and may lead to account suspension and legal consequences under the Information Technology Act, 2000. Any misuse of the platform, attempt to manipulate results, or unethical activity shall result in immediate termination of access without refund.' },
                { heading: 'Data and Privacy', content: 'Candidate data shall be shared only with verified employers, consultancies, or institutions registered on the TaleGlobal platform for legitimate recruitment purposes. TaleGlobal complies with the Digital Personal Data Protection Act, 2023, Information Technology Act, 2000, and the IT (Data Protection) Rules 2011 to ensure confidentiality, lawful processing, and secure storage of personal data. Candidates retain rights of access, correction, and erasure of their personal data in accordance with applicable privacy laws and may contact the designated Grievance Officer for any related concerns.' },
                { heading: 'Liability', content: 'TaleGlobal acts solely as an online intermediary connecting candidates with verified employers and does not guarantee interviews, employment, or offer letters. TaleGlobal shall not be liable for any act, omission, or representation made by employers, consultancies, or placement officers, nor for any loss financial, professional, or reputational arising from platform usage. In no event shall TaleGlobal\'s aggregate liability exceed the total fee paid by the candidate for the specific application that gave rise to such claim.' },
                ...commonLegalSections
            ]
        },
        employer: {
            title: 'Terms & Conditions for Employers',
            sections: [
                { heading: 'Registration and Verification', content: 'Employers must complete the mandatory TaleGlobal verification process prior to posting any job openings. Verification shall include submission of valid business registration certificates, GSTIN, PAN, and other business identity proofs as may be required under the Information Technology Act, 2000 and applicable labour and tax laws. TaleGlobal reserves the right to seek additional documents or conduct background checks to ensure authenticity. Only verified employers shall be permitted to post job listings on the platform. The act of registration constitutes a valid and binding electronic agreement under Section 10A of the Information Technology Act, 2000.' },
                { heading: 'Job Posting and Process', content: 'Each job listing must accurately specify the job title, eligibility criteria, remuneration or compensation (if applicable), interview schedule, and selection process. Employers must declare the expected timeline for issuing offer letters and adhere to the same to maintain process transparency. Job postings shall be genuine, lawful, and compliant with employment and labour regulations, including those relating to equal opportunity and non-discrimination. TaleGlobal reserves the right to moderate, suspend, or remove any job listing that is false, misleading, discriminatory, or otherwise violates these Terms or any applicable law. Posting of fraudulent, deceptive, or unverifiable job listings shall attract immediate suspension and may invite civil or criminal proceedings.' },
                ...commonLegalSections
            ]
        },
        employerProfile: {
            title: 'Terms & Conditions for Employers',
            sections: [
                { heading: 'Registration and Verification', content: 'Employers must complete the mandatory TaleGlobal verification process prior to posting any job openings. Verification shall include submission of valid business registration certificates, GSTIN, PAN, and other business identity proofs as may be required under the Information Technology Act, 2000 and applicable labour and tax laws. TaleGlobal reserves the right to seek additional documents or conduct background checks to ensure authenticity. Only verified employers shall be permitted to post job listings on the platform. TaleGlobal may suspend or cancel access if verification information is found to be false, incomplete, or misleading. The act of registration constitutes a valid and binding electronic agreement under Section 10A of the Information Technology Act, 2000, confirming the employer\'s acceptance of these Terms and Conditions.' },
                { heading: 'Job Posting and Process', content: 'Each job listing must accurately specify the job title, eligibility criteria, remuneration or compensation (if applicable), interview schedule, and selection process. Employers must declare the expected timeline for issuing offer letters and adhere to the same to maintain process transparency. Job postings shall be genuine, lawful, and compliant with employment and labour regulations, including those relating to equal opportunity and non-discrimination. TaleGlobal reserves the right to moderate, suspend, or remove any job listing that is false, misleading, discriminatory, or otherwise violates these Terms or any applicable law. Employers acknowledge that TaleGlobal functions solely as an intermediary platform and bears no responsibility for the accuracy, outcome, or fulfillment of any employment contract arising from such postings. Posting of fraudulent, deceptive, or unverifiable job listings shall attract immediate suspension and may invite civil or criminal proceedings under the Information Technology Act, 2000, BNS, and other applicable laws.' },
                ...commonLegalSections
            ]
        },
        placement: {
            title: 'Terms & Conditions for Placement Officers',
            sections: [
                { heading: 'Registration and Verification', content: 'Placement Officers must provide valid institutional credentials and official contact information. Your account will be verified before activation to ensure authenticity. Registration constitutes a legally binding electronic agreement under applicable laws.' },
                { heading: 'Student Data Management', content: 'You are responsible for the accuracy of student data uploaded to the platform. Student information must be uploaded with proper consent from students and the institution. All data must comply with UGC and AICTE guidelines governing campus placements.' },
                { heading: 'Credit Allocation', content: 'Credits allocated to students are managed by your institution. You are responsible for fair distribution of credits among students. Credit usage and allocation must be transparent and documented.' },
                { heading: 'Data Privacy', content: 'You must comply with data protection regulations when handling student information. Student data should only be used for placement purposes. Unauthorized sharing or commercial use of student data is strictly prohibited.' },
                ...commonLegalSections
            ]
        }
    };

    const content = termsContent[role] || termsContent.candidate;

    if (!isOpen) return null;

    const modalContent = (
        <div className="terms-modal-overlay">
            <div className="terms-modal" data-role={role}>
                <div className="terms-modal-header">
                    <h2>{content.title}</h2>
                    <button className="terms-close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="terms-modal-body" onScroll={handleScroll}>
                    <div className="terms-content">
                        <p className="terms-intro">
                            Please read and accept the following terms and conditions before proceeding with your registration.
                        </p>
                        
                        {content.sections.map((section, index) => (
                            <div key={index} className="terms-section">
                                <h3>{index + 1}. {section.heading}</h3>
                                <p>{section.content}</p>
                            </div>
                        ))}

                        <div className="terms-section">
                            <h3>{content.sections.length + 1}. Acceptance of Terms</h3>
                            <p>
                                By checking the acceptance box and clicking "Accept & Continue", you acknowledge that you have read, 
                                understood, and agree to be bound by these terms and conditions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="terms-modal-footer">
                    {!hasScrolled && (
                        <div className="scroll-hint" style={{marginBottom: '12px', fontSize: '13px', color: '#fd7e14'}}>
                            📜 Please scroll to the bottom to read all terms and conditions
                        </div>
                    )}
                    <div className="terms-checkbox-wrapper">
                        <input
                            type="checkbox"
                            id="terms-accept"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                        />
                        <label htmlFor="terms-accept">
                            I have read and accept the terms and conditions
                        </label>
                    </div>
                    
                    <div className="terms-actions">
                        <button className="terms-btn terms-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            className="terms-btn terms-btn-accept" 
                            onClick={handleAccept}
                            disabled={!accepted || !hasScrolled}
                            title={!hasScrolled ? "Please scroll to the bottom to read all terms" : ""}
                        >
                            Accept & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default TermsModal;
