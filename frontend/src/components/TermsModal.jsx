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
        candidateInterviewInstructions: {
            title: 'Candidate Instructions for Interviews',
            sections: [
                { heading: 'Device and Connectivity Requirements', content: 'Please ensure you use a laptop, desktop, or tablet for a better experience while using the TaleGlobal platform. Using a stable internet connection and proper signal is strongly recommended.' },
                { heading: 'Slot Booking Is Final', content: 'Before booking an interview slot, please note that once a slot is booked, it cannot be cancelled or rescheduled under any circumstances.' },
                { heading: 'No Show Policy', content: 'If you fail to attend the interview on the scheduled date and time after booking a slot, it will be considered as No Show, which means you will be disqualified and not eligible for further rounds.' },
                { heading: 'Audio and Video Monitoring', content: 'During assessment tests and interviews, your audio and video will remain active throughout the session. Your face must be clearly visible, and the cursor should remain active on the screen during the test.' },
                { heading: 'Tab Switching Restriction', content: 'Switching tabs, leaving the test window, or any suspicious activity may lead to the immediate cancellation of the assessment.' },
                { heading: 'No External Assistance', content: 'If it is found that someone is assisting you during the assessment or interview, for example another person seen in the camera or guiding you, the employer has full rights to reject your application even if you pass the assessment test.' },
                { heading: 'Interviewer Decision Rights', content: 'Even after clearing the assessment test, the interviewer has the right to reject a candidate during the interview stage if unfair practices or policy violations are observed.' },
                { heading: 'No Refund for Missed Assessment or Slot', content: 'If you fail to take the assessment test or fail to book an interview slot after making the payment, TaleGlobal will not be responsible and no refund of application fees will be provided.' },
                { heading: 'No Refund for Non-Selection', content: 'If a candidate does not clear the interview or any stage of the selection process, it is not the responsibility of TaleGlobal, and no refund will be issued.' },
                { heading: 'Refresh Dashboard After Interview', content: 'After completing the interview, please refresh your dashboard to view the updated status in the Application Tracking section.' },
                { heading: 'Raise Company Support Ticket First', content: 'If there is no response from the employer after the interview, you can raise a support ticket directly to the applied company through your dashboard. Employers are expected to respond within 3 to 4 working days.' },
                { heading: 'Escalate to TaleGlobal Support', content: 'If there is still no response from the employer, you may contact TaleGlobal support by raising a ticket or sending an email to support@taleglobal.net.' },
                { heading: 'Check Dashboard Regularly', content: 'Candidates are advised to check their dashboard regularly for updates regarding assessments, interview slots, and application status.' },
                { heading: 'Document Upload Is Optional', content: 'The platform provides an option to upload mark sheets or documents, but it is not mandatory to upload them.' },
                { heading: 'Protect OTP and Personal Documents', content: 'TaleGlobal and employers on the platform will never ask for OTPs or personal documents through unofficial channels. If you clear all interview stages, you may share your documents directly with the selected company through their official email ID.' },
                { heading: 'Eligibility and Document Verification', content: 'If at any stage it is found that educational documents are not valid or eligibility criteria are not met, the candidate may be disqualified at any point of the recruitment process.' },
                { heading: 'Offer Letter Issuance', content: 'If selected, the offer letter will be sent directly by the company to the official email ID provided in your profile. TaleGlobal does not issue offer letters. Candidates are advised to update their dashboard once they receive the offer letter.' }
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
        employerJobPosting: {
            title: 'Employer Instructions for Job Posting',
            sections: [
                { heading: 'Interview Dates Are Mandatory', content: 'While posting a job on the TaleGlobal platform, it is mandatory to specify the interview dates and available slot timings. Employers must ensure that interviews are conducted on the scheduled dates without fail. Failure to conduct interviews as scheduled may lead to blacklisting from the platform.' },
                { heading: 'Timely Status Updates', content: 'Employers must update the candidate interview status immediately after each interview round. Status updates are very important because candidate eligibility for the next round of interview and slot booking depends on the status updated by the employer. If the status is not updated, candidates will not be able to book slots for the next stage.' },
                { heading: 'Assessment / Written Test Process', content: 'If the hiring process includes an assessment test or written test, employers must set the minimum qualifying percentage while creating the assessment. Candidates who meet the qualifying percentage will automatically become eligible for the next interview round immediately after completing the assessment. Eligible candidates will be able to book interview slots directly after the assessment.' },
                { heading: 'Assessment Monitoring & Integrity', content: 'During the assessment test, the candidate audio and video will remain active throughout the test for monitoring purposes. Images captured during the test will be available in the applicant list. Employers have the right to reject candidates if any malpractice is detected, such as copying answers, using a mobile device, or taking help from others.' },
                { heading: 'Interview Completion on Scheduled Date', content: 'Employers are advised to complete the interview process on the scheduled date and time. If the interview schedule is skipped, it may not be possible to reschedule the same interview for that day and time.' },
                { heading: 'Importance of Status Updates', content: 'Updating the candidate status plays a vital role in the TaleGlobal platform. Based on the status updated by the employer, subsequent stages of the hiring process will open automatically for candidates.' },
                { heading: 'First Come, First Serve Slot Booking', content: 'Interview slot booking works on a first come, first serve basis. Candidates will be able to book available slots depending on availability.' },
                { heading: 'Vacancy and Application Limit', content: 'Employers must specify the number of vacancies available and the maximum number of applications allowed. Once the application limit is reached, the job posting will automatically close and no further applications will be accepted.' },
                { heading: 'Application Deadline', content: 'Candidates cannot apply after the last date of application mentioned in the job posting.' },
                { heading: 'Reposting Jobs', content: 'If candidates are not shortlisted or the position remains unfilled, employers can repost the same job again on the platform free of cost.' }
            ]
        },
        employerInterviewStatusUpdate: {
            title: 'Interview Status - Description',
            sections: [
                { heading: 'Shortlisted for Next Round', content: 'If this status is selected, the candidate becomes eligible for the next round of interview, and the next round slot booking will automatically open in the candidate dashboard.' },
                { heading: 'Under Review', content: 'The candidate interview performance is currently being evaluated by the hiring team. The candidate will not be able to book the next round slot until the status is updated.' },
                { heading: 'On Hold', content: 'The candidate application is temporarily kept on hold. No further stages or interview slots will open until the status is changed.' },
                { heading: 'Selected', content: 'The candidate has successfully cleared the interview process and is selected for the role. The employer can proceed with the offer process.' },
                { heading: 'Pending Decision', content: 'The final decision regarding the candidate is yet to be made. The candidate will remain in the current stage until the status is updated.' },
                { heading: 'No Show', content: 'The candidate did not attend the scheduled interview at the booked date and time. The candidate will not be eligible for further interview rounds.' },
                { heading: 'Not Advanced to Next Stage', content: 'The candidate will not be progressing to the next stage of the hiring process.' }
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
