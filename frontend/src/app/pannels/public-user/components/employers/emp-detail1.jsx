import JobZImage from "../../../../common/jobz-img";
import SectionEmployersCandidateSidebar from "../../sections/common/section-emp-can-sidebar";
import SectionShareProfile from "../../sections/common/section-share-profile";
import SectionOfficePhotos1 from "../../sections/common/section-office-photos1";
import SectionOfficeVideo1 from "../../sections/common/section-office-video1";
import SectionAvailableJobsList from "../../sections/employers/detail/section-available-jobs-list";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { loadScript } from "../../../../../globals/constants";
import "../jobs/job-detail.css";
import "../../../../../employer-detail-tabs.css";
import "../../../../../emp-detail-mobile-tabs-fix.css";
import "../../../../../emp-detail-title-fix.css";
import "../../../../../emp-detail-responsive-fix.css";
import "../../../../../emp-detail-form-fix.css";
import "../../../../../emp-detail-review-mobile-fix.css";

import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
function EmployersDetail1Page() {
    const { id } = useParams();
    const [employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ averageRating: 0, reviewCount: 0 });
    const [reviewForm, setReviewForm] = useState({
        reviewerName: '',
        reviewerEmail: '',
        rating: 0,
        description: '',
        image: null
    });

    const [submittedReviews, setSubmittedReviews] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(()=>{
        loadScript("js/custom.js");
        // Check if user is logged in
        const token = localStorage.getItem('candidateToken') || localStorage.getItem('userToken');
        setIsLoggedIn(!!token);
        
        if (id) {
            fetchEmployerDetails();
            fetchReviews();
        }
    }, [id]);

    // Update submitted reviews when reviews or login status changes
    useEffect(() => {
        fetchSubmittedReviews();
    }, [reviews, isLoggedIn]);

    const fetchSubmittedReviews = async () => {
        const email = localStorage.getItem('reviewerEmail');
        
        try {
            if (email && isLoggedIn) {
                // If user is logged in and has email, show their specific reviews
                const response = await fetch(`http://localhost:5000/api/public/employers/${id}/submitted-reviews?email=${email}`);
                const data = await response.json();
                if (data.success) {
                    setSubmittedReviews(data.reviews);
                }
            } else {
                // If user is not logged in, show all approved reviews
                setSubmittedReviews(reviews);
            }
        } catch (error) {
            console.error('Error fetching submitted reviews:', error);
        }
    };

    const fetchEmployerDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/public/employers/${id}`);
            const data = await response.json();
            
            if (data.success) {
                console.log('Employer data received:', data.profile);
                console.log('Company name fields:', {
                    companyName: data.profile.companyName,
                    employerIdCompanyName: data.profile.employerId?.companyName,
                    employerIdName: data.profile.employerId?.name
                });
                setEmployer(data.profile);
                
            } else {
                
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/public/employers/${id}/reviews`);
            const data = await response.json();
            if (data.success) {
                setReviews(data.reviews);
                setReviewStats({
                    averageRating: data.averageRating,
                    reviewCount: data.reviewCount
                });
            }
        } catch (error) {
            
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`http://localhost:5000/api/public/employers/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewForm)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('Review submitted successfully! Thank you for your feedback.');
                localStorage.setItem('reviewerEmail', reviewForm.reviewerEmail);
                // Refresh all reviews and then submitted reviews
                await fetchReviews();
                setReviewForm({
                    reviewerName: '',
                    reviewerEmail: '',
                    rating: 0,
                    description: '',
                    image: null
                });
                // Switch to Review Post tab
                setTimeout(() => {
                    const reviewPostTab = document.querySelector('a[href="#review-post"]');
                    if (reviewPostTab) reviewPostTab.click();
                }, 1000);
            } else {
                showError(data.message || data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showError('Network error while submitting review. Please try again.');
        }
    };

    const renderStars = (rating, interactive = false, onStarClick = null) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star ${i <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                    onClick={interactive ? () => onStarClick(i) : undefined}
                    style={{
                        color: i <= rating ? '#ffc107' : '#e4e5e9',
                        fontSize: '20px',
                        cursor: interactive ? 'pointer' : 'default',
                        marginRight: '2px'
                    }}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setReviewForm({...reviewForm, image: event.target.result});
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return <div className="text-center p-5">Loading employer details...</div>;
    }

    if (!employer) {
        return <div className="text-center p-5">Employer not found</div>;
    }

    return (
			<>
				<div className="section-full p-t120 p-b90 bg-white emp-detail">
					<div className="container">
						<div className="section-content">
							<div className="row d-flex justify-content-center">
								<div className="col-lg-8 col-md-12">
									{/* Candidate detail START */}
									<div className="cabdidate-de-info">
										<div className="twm-job-self-wrap">
											<div className="twm-job-self-info">
												<div className="twm-job-self-top">
													<div className="twm-media-bg">
														{employer.coverImage ? (
															<img 
																src={employer.coverImage} 
																alt="Company Cover" 
															/>
														) : (
															<JobZImage 
																src="images/employer-bg.jpg" 
																alt="#" 
															/>
														)}
													</div>

													<div className="twm-mid-content">
														<div className="twm-media">
															{employer.logo ? (
																<img 
																	src={employer.logo} 
																	alt="Company Logo" 
																/>
															) : (
																<JobZImage 
																	src="images/jobs-company/pic1.jpg" 
																	alt="#" 
																/>
															)}
														</div>

														<h4 className="twm-job-title">
															{employer.companyName || 
															 employer.employerId?.companyName || 
															 employer.employerId?.name || 
															 employer.name ||
															 employer.company ||
															 'Company Name Not Available'}
														</h4>
														<p className="twm-employer-industry" style={{color: '#6b7280', marginBottom: '10px'}}>
															<i className="feather-briefcase" style={{marginRight: '8px', color: '#ff6b35'}}></i>
															{employer.industrySector || employer.industry || 'Various Industries'}
														</p>
														<div className="hiring-type-badge" style={{marginBottom: '15px'}}>
															<span className={`badge ${employer.employerId?.employerType === 'consultant' ? 'badge-warning' : 'badge-success'}`} 
																style={{fontSize: '14px', padding: '8px 16px', fontWeight: '600'}}>
																<i className={`feather-${employer.employerId?.employerType === 'consultant' ? 'users' : 'building'}`} style={{marginRight: '6px'}}></i>
																{employer.employerId?.employerType === 'consultant' ? 'Recruitment Consultancy' : 'Direct Hiring Company'}
															</span>
														</div>
														<p className="twm-job-address">
															<i className="feather-map-pin" />
															{employer.corporateAddress || employer.location || 'Location not specified'}
														</p>
													</div>
												</div>
											</div>
										</div>

										{/* Tabs Navigation */}
										<ul className="nav nav-tabs mt-4" role="tablist">
											<li className="nav-item">
												<a
													className="nav-link active"
													data-bs-toggle="tab"
													href="#overview"
													role="tab"
												>
													Overview
												</a>
											</li>

											<li className="nav-item">
												<a
													className="nav-link"
													data-bs-toggle="tab"
													href="#jobs"
													role="tab"
												>
													Jobs
												</a>
											</li>
											
											{isLoggedIn && (
												<li className="nav-item">
													<a
														className="nav-link"
														data-bs-toggle="tab"
														href="#reviews"
														role="tab"
													>
														Add Reviews
													</a>
												</li>
											)}
											
											<li className="nav-item">
												<a
													className="nav-link"
													data-bs-toggle="tab"
													href="#review-post"
													role="tab"
												>
													Review Posted
												</a>
											</li>
											
											<li className="nav-item">
												<a
													className="nav-link"
													data-bs-toggle="tab"
													href="#gallery"
													role="tab"
												>
													Gallery
												</a>
											</li>
										</ul>

										{/* Tabs Content */}
										<div className="tab-content p-t20">
											<div
												className="tab-pane fade show active"
												id="overview"
												role="tabpanel"
											>
												<h4 className="twm-s-title">About Company</h4>
												<div dangerouslySetInnerHTML={{
													__html: employer.description || employer.companyDescription || 'No company description available.'
												}} />

												<h4 className="twm-s-title">Why Join Us</h4>
												<div dangerouslySetInnerHTML={{
													__html: employer.whyJoinUs || 'No information available about why to join this company.'
												}} />


											</div>

											<div className="tab-pane fade" id="jobs" role="tabpanel">
												<SectionAvailableJobsList employerId={id} />
											</div>
											
											<div className="tab-pane fade" id="gallery" role="tabpanel">
												<h4 className="twm-s-title">Company Gallery</h4>
												{employer.gallery && employer.gallery.length > 0 ? (
													<div className="gallery-container">
														{employer.gallery.map((image, index) => (
															<div key={image._id || index} className="gallery-item">
																<img 
																	src={image.url} 
																	alt={`Gallery ${index + 1}`}
																	className="img-fluid rounded"
																	style={{
																		width: '100%', 
																		height: '100%', 
																		objectFit: 'cover',
																		cursor: 'pointer',
																		transition: 'transform 0.3s ease',
																		border: '1px solid #ddd'
																	}}
																	onClick={() => setSelectedImage(image.url)}
																	onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
																	onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
																/>
															</div>
														))}
													</div>
												) : (
													<div className="text-center p-4">
														<p className="text-muted">No gallery images available.</p>
													</div>
												)}
												
												{/* Image Modal */}
												{selectedImage && createPortal(
													<div 
														style={{
															position: 'fixed',
															top: 0,
															left: 0,
															width: '100vw',
															height: '100vh',
															backgroundColor: 'rgba(0,0,0,0.9)',
															zIndex: 9999999,
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															padding: '20px'
														}}
														onClick={() => setSelectedImage(null)}
													>
														<div 
															style={{
																position: 'relative',
																maxWidth: '90vw',
																maxHeight: '90vh',
																display: 'flex',
																flexDirection: 'column'
															}}
															onClick={(e) => e.stopPropagation()}
														>
															<div style={{
																display: 'flex',
																justifyContent: 'flex-end',
																marginBottom: '10px',
																position: 'relative',
																zIndex: 10
															}}>
																<button
																	style={{
																		background: '#ff6b35',
																		border: 'none',
																		color: 'white',
																		borderRadius: '50%',
																		width: '40px',
																		height: '40px',
																		fontSize: '24px',
																		cursor: 'pointer',
																		display: 'flex',
																		alignItems: 'center',
																		justifyContent: 'center',
																		boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
																		transition: 'all 0.3s ease'
																	}}
																	onClick={() => setSelectedImage(null)}
																	onMouseOver={(e) => e.target.style.background = '#e74c3c'}
																	onMouseOut={(e) => e.target.style.background = '#ff6b35'}
																>
																	×
																</button>
															</div>
															<img 
																src={selectedImage}
																alt="Gallery"
																style={{
																	maxWidth: '100%',
																	maxHeight: 'calc(90vh - 60px)',
																	width: 'auto',
																	height: 'auto',
																	objectFit: 'contain',
																	borderRadius: '8px',
																	boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
																}}
															/>
														</div>
													</div>,
													document.body
												)}
											</div>
											

											
											{isLoggedIn && (
												<div className="tab-pane fade" id="reviews" role="tabpanel">
													<div className="row justify-content-center">
														<div className="col-md-8">
															<h4 className="twm-s-title">Add Your Review</h4>
														<form onSubmit={handleReviewSubmit} className="review-form">
															<div className="mb-3">
																<label className="form-label">Your Name <span style={{ color: 'red' }}>*</span></label>
																<input
																	type="text"
																	className="form-control"
																	value={reviewForm.reviewerName}
																	onChange={(e) => setReviewForm({...reviewForm, reviewerName: e.target.value})}
																	required
																/>
															</div>
															
															<div className="mb-3">
																<label className="form-label">Your Email <span style={{ color: 'red' }}>*</span></label>
																<input
																	type="email"
																	className="form-control"
																	value={reviewForm.reviewerEmail}
																	onChange={(e) => setReviewForm({...reviewForm, reviewerEmail: e.target.value})}
																	required
																/>
															</div>
															
															<div className="mb-3">
																<label className="form-label">Rating <span style={{ color: 'red' }}>*</span></label>
																<div className="rating-input">
																	{renderStars(reviewForm.rating, true, (rating) => setReviewForm({...reviewForm, rating}))}
																</div>
															</div>
															
															<div className="mb-3">
																<label className="form-label">Your Review <span style={{ color: 'red' }}>*</span></label>
																<textarea
																	className="form-control"
																	rows="4"
																	value={reviewForm.description}
																	onChange={(e) => setReviewForm({...reviewForm, description: e.target.value})}
																	placeholder="Share your experience with this company..."
																	required
																/>
															</div>
															
															<div className="mb-3">
																<label className="form-label">Add Image (Optional)</label>
																<input
																	type="file"
																	className="form-control"
																	accept="image/*"
																	onChange={handleImageUpload}
																/>
																{reviewForm.image && (
																	<div className="mt-2">
																		<img 
																			src={reviewForm.image} 
																			alt="Preview" 
																			style={{width: '100px', height: '100px', objectFit: 'cover'}} 
																			className="rounded"
																		/>
																	</div>
																)}
															</div>
															
															<button 
																type="submit" 
																className="site-button"
															>
																Submit Review
															</button>
														</form>
													</div>
												</div>
											</div>
											)}
											
											<div className="tab-pane fade" id="review-post" role="tabpanel">
												<h4 className="twm-s-title">{isLoggedIn && localStorage.getItem('reviewerEmail') ? 'Your Submitted Reviews' : 'Company Reviews'}</h4>
												{submittedReviews.length > 0 ? (
													<div className="submitted-reviews-list">
														{submittedReviews.map((review, index) => (
															<div key={review._id || index} className="card shadow-sm mb-4">
																<div className="card-header bg-light d-flex justify-content-between align-items-center">
																	<div className="d-flex align-items-center">
																		<div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
																			<span className="text-white fw-bold">{review.reviewerName.charAt(0).toUpperCase()}</span>
																		</div>
																		<div className="d-flex align-items-center flex-wrap">
																			<h6 className="mb-0 fw-bold me-2">{review.reviewerName}</h6>
																			<small className="text-muted">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
																		</div>
																	</div>
																	<span className="badge bg-success px-3 py-2" style={{fontSize: '0.75rem'}}>✓ Published</span>
																</div>
																<div className="card-body p-4">
																	{review.image && (
																		<div className="mb-3 d-flex align-items-center">
																			<h6 className="fw-semibold mb-0 me-2" style={{ whiteSpace: 'nowrap' }}>Attached Image:</h6>
																			<img 
																				src={review.image} 
																				alt="Review" 
																				style={{width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer'}} 
																				className="rounded-circle border"
																				onClick={() => setSelectedImage(review.image)}
																			/>
																		</div>
																	)}
																	<div className="mb-3 d-flex align-items-center">
																		<h6 className="fw-semibold mb-0 me-2" style={{ whiteSpace: 'nowrap' }}>Rating:</h6>
																		{renderStars(review.rating)}
																		<span className="ms-2 text-muted">({review.rating}/5)</span>
																	</div>
																	<div className="mb-3 d-flex align-items-start">
																		<h6 className="fw-semibold mb-0 me-2" style={{ whiteSpace: 'nowrap' }}>Review:</h6>
																		<p className="text-dark mb-0" style={{lineHeight: '1.6'}}>{review.description}</p>
																	</div>
																</div>
															</div>
														))}
													</div>
												) : (
													<div className="text-center p-4">
														{isLoggedIn && localStorage.getItem('reviewerEmail') ? (
															<>
																<p className="text-muted">You haven't submitted any reviews yet.</p>
																<p>Go to the Add Reviews tab to submit your first review!</p>
															</>
														) : (
															<p className="text-muted">No reviews available for this company yet.</p>
														)}
													</div>
												)}
											</div>
										</div>

										<SectionShareProfile />

										<div className="twm-two-part-section">
											<div className="row">
												<div className="col-lg-6 col-md-6">
													{/* <SectionOfficePhotos1 /> */}
												</div>
												<div className="col-lg-6 col-md-6">
													{/* <SectionOfficeVideo1 /> */}
												</div>
											</div>
										</div>

										{/* <SectionAvailableJobsList />  */}
									</div>
								</div>

								<div className="col-lg-4 col-md-12 rightSidebar">
									<SectionEmployersCandidateSidebar type="1" employer={employer} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
}

export default EmployersDetail1Page;
