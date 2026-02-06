import { useState } from 'react';
import { validatePhoneNumber } from '../../../../../utils/phoneValidation';
import '../../../../../contact-us-styles.css';
import '../../../../../remove-profile-hover-effects.css';

function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        phoneCountryCode: '+91',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (formData.phone.trim()) {
            const fullPhone = `${formData.phoneCountryCode}${formData.phone.trim()}`;
            const phoneValidation = validatePhoneNumber(fullPhone);
            if (!phoneValidation.isValid) {
                newErrors.phone = phoneValidation.message;
            }
        }
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                phone: `${formData.phoneCountryCode}${formData.phone.trim()}`
            };

            const response = await fetch('/api/public/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            
            if (response.ok) {
                setIsSubmitted(true);
                setFormData({ name: '', email: '', phone: '', phoneCountryCode: '+91', subject: '', message: '' });
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || 'Failed to submit form' });
            }
        } catch (error) {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <>
            <div className="section-full twm-contact-one">
                <div className="section-content">
                    <div className="container">
                        {/* CONTACT FORM*/}
                        <div className="contact-one-inner">
                            <div className="row">
                                <div className="col-lg-7 col-md-12">
                                    <div className="contact-form-outer">
                                        {/* title="" START*/}
                                        {isSubmitted ? (
                                            <div className="section-head left wt-small-separator-outer text-center">
                                                <h2 className="wt-title text-success">✓ Submitted Successfully!</h2>
                                                <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
                                                <button 
                                                    onClick={() => setIsSubmitted(false)} 
                                                    className="site-button mt-3"
                                                >
                                                    Send Another Message
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="section-head left wt-small-separator-outer">
                                                <h2 className="wt-title">Send Us a Message</h2>
                                                <p>Feel free to contact us and we will get back to you as soon as we can.</p>
                                            </div>
                                        )}
                                        {/* title="" END*/}
                                        {!isSubmitted && (
                                        <form className="cons-contact-form" onSubmit={handleSubmit}>
                                            {errors.submit && (
                                                <div className="alert alert-danger mb-3">{errors.submit}</div>
                                            )}
                                            <div className="row">
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="form-group mb-3">
                                                        <input 
                                                            name="name" 
                                                            type="text" 
                                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                            placeholder="Name" 
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                        />
                                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="form-group mb-3">
                                                        <input 
                                                            name="email" 
                                                            type="email" 
                                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                            placeholder="Email" 
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                        />
                                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-md-12">
                                                    <div className="form-group mb-3">
                                                        <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                                                            <span style={{ position: 'absolute', left: '12px', color: '#000', fontSize: '14px', zIndex: '10', pointerEvents: 'none' }}>{formData.phoneCountryCode}</span>
                                                            <input 
                                                                name="phone" 
                                                                type="tel" 
                                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                                placeholder="Phone Number" 
                                                                value={formData.phone}
                                                                onChange={handleChange}
                                                                style={{ paddingLeft: '50px' }}
                                                            />
                                                            {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 col-md-6">
                                                    <div className="form-group mb-3">
                                                        <input 
                                                            name="subject" 
                                                            type="text" 
                                                            className="form-control" 
                                                            placeholder="Subject" 
                                                            value={formData.subject}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12">
                                                    <div className="form-group mb-3">
                                                        <textarea 
                                                            name="message" 
                                                            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                                            rows={3} 
                                                            placeholder="Message" 
                                                            value={formData.message}
                                                            onChange={handleChange}
                                                        />
                                                        {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <button 
                                                        type="submit" 
                                                        className="site-button"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Submitting...' : 'Submit Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                        )}
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-12">
                                    <div className="contact-info-wrap mt-lg-5">
                                        <div className="contact-info">
                                            <div className="contact-info-section">
                                                <div className="c-info-column" style={{display: 'none'}}>
                                                    <div className="c-info-icon custome-size"><i className="fas fa-mobile-alt" /></div>
                                                    <h3 className="twm-title">Feel free to contact us</h3>
                                                    <p><a href="tel:+919876543210">+91 9876543210</a></p>
                                                    <p><a href="tel:+919807623145">+91 9807623145</a></p>
                                                </div>
                                                <div className="c-info-column" style={{marginBottom: '10px'}}>
                                                    <h3 className="twm-title">Address</h3>
                                                    <p>C/o, FCG ADVISORS LLP, No.10, 1st main Road, J lingaiah Road, Seshadripuram, bangalore - 560020</p>
                                                </div>
                                                <div className="c-info-column">
                                                    <h3 className="twm-title">Support</h3>
                                                    <p><a href="mailto:info@taleglobal.net" style={{color: '#1976d2 !important', textDecoration: 'underline !important', cursor: 'pointer !important', pointerEvents: 'auto !important', position: 'relative', zIndex: 999}}>info@taleglobal.net</a></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default ContactUsPage;
