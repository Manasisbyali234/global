import React from 'react';

function PrivacyPolicyPage() {
    return (
        <div className="page-content" style={{backgroundColor: 'oklch(98.5% 0.002 247.839)', minHeight: '100vh'}}>
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
            
            <div className="container">
                <div className="section-full p-t120 p-b90">
                    <div className="privacy-container">
                        <div className="privacy-header">
                            <h1>Privacy Policy</h1>
                            <div className="subtitle">Data Protection & Privacy Guidelines</div>
                        </div>
                        
                        <div className="privacy-content">
                            <div className="last-updated">
                                <strong>Last Updated:</strong> November 2025
                            </div>
                            
                            <h3 className="section-title">1. Information We Collect</h3>
                            <p>We collect information you provide directly to us, such as when you create an account, apply for jobs, or contact us. This includes:</p>
                            <ul>
                                <li>Personal information (name, email address, phone number)</li>
                                <li>Professional information (resume, work experience, skills)</li>
                                <li>Account credentials (username, password)</li>
                                <li>Communication preferences</li>
                            </ul>
                            
                            <h3 className="section-title">2. How We Use Your Information</h3>
                            <p>We use the information we collect to:</p>
                            <ul>
                                <li>Provide, maintain, and improve our job portal services</li>
                                <li>Match you with relevant job opportunities</li>
                                <li>Communicate with you about jobs, services, and updates</li>
                                <li>Respond to your comments, questions, and requests</li>
                                <li>Monitor and analyze trends and usage</li>
                            </ul>
                            
                            <h3 className="section-title">3. Information Sharing</h3>
                            <p>We may share your information in the following situations:</p>
                            <ul>
                                <li>With employers when you apply for jobs or express interest</li>
                                <li>With service providers who assist us in operating our platform</li>
                                <li>When required by law or to protect our rights</li>
                                <li>With your consent or at your direction</li>
                            </ul>
                            
                            <h3 className="section-title">4. Data Security</h3>
                            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                            
                            <h3 className="section-title">5. Your Rights</h3>
                            <p>You have the right to:</p>
                            <ul>
                                <li>Access and update your personal information</li>
                                <li>Delete your account and personal data</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Request a copy of your data</li>
                            </ul>
                            
                            <h3 className="section-title">6. Cookies and Tracking</h3>
                            <p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.</p>
                            
                            <h3 className="section-title">7. Third-Party Links</h3>
                            <p>Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.</p>
                            
                            <h3 className="section-title">8. Changes to This Policy</h3>
                            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
                            
                            <h3 className="section-title">9. Contact Us</h3>
                            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                            <p>Email: info@taleglobal.net<br/>
                            Address: Bangalore, 560092</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicyPage;