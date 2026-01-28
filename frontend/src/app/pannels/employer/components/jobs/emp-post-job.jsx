import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useParams } from "react-router-dom";
import { employer, empRoute, publicUser } from "../../../../../globals/route-names";
import { holidaysApi } from "../../../../../utils/holidaysApi";
import HolidayIndicator from "../../../../../components/HolidayIndicator";

import { api } from "../../../../../utils/api";
import InterviewDateTester from "../../../../../components/InterviewDateTester";
import { ErrorDisplay, GlobalErrorDisplay } from "../../../../../components/ErrorDisplay";
import { validateField, validateForm, displayError, safeApiCall, getErrorMessage } from "../../../../../utils/errorHandler";
import RichTextEditor from "../../../../../components/RichTextEditor";
import { formatTimeToAMPM } from "../../../../../utils/dateFormatter";

import "../../../../../components/ErrorDisplay.css";

// Location options array
const LOCATION_OPTIONS = [
	"Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad",
	"Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
	"Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",
	"Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali", "Vasai-Virar",
	"Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad",
	"Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
	"Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Thiruvananthapuram", "Solapur",
	"Hubballi-Dharwad", "Tiruchirappalli", "Bareilly", "Mysore", "Tiruppur", "Gurgaon",
	"Aligarh", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Guntur", "Bhiwandi",
	"Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai Nagar",
	"Cuttack", "Firozabad", "Kochi", "Bhavnagar", "Dehradun", "Durgapur", "Asansol",
	"Nanded", "Kolhapur", "Ajmer", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri",
	"Jhansi", "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode",
	"Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur",
	"Maheshtala", "Remote", "Work From Home", "Hybrid"
];

const PREDEFINED_JOB_TITLES = [
	"Software Engineer", "Senior Software Engineer", "Frontend Developer", "Backend Developer", 
	"Full Stack Developer", "Data Scientist", "Data Analyst", "Product Manager", 
	"Project Manager", "Business Analyst", "UI/UX Designer", "Graphic Designer", 
	"Marketing Manager", "Sales Manager", "Sales Executive", "HR Manager", 
	"HR Executive", "Finance Manager", "Accountant", "Content Writer", 
	"Digital Marketing Specialist", "Customer Support Executive", "Operations Manager", 
	"Quality Assurance Engineer", "DevOps Engineer", "System Administrator", 
	"Network Administrator", "Telecaller"
];

const PREDEFINED_CATEGORIES = [
	"IT", "Sales", "Marketing", "Sales & Marketing", "Finance", "HR", "Operations", 
	"Design", "Content", "Healthcare", "Education"
];

// LocationSearchInput Component
function LocationSearchInput({ value, onChange, error, style }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);
	const [filteredLocations, setFilteredLocations] = useState(LOCATION_OPTIONS);

	const selectedLocations = Array.isArray(value) ? value : (value ? [value] : []);

	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredLocations(LOCATION_OPTIONS.filter(loc => !selectedLocations.includes(loc)));
		} else {
			const filtered = LOCATION_OPTIONS.filter(location =>
				location.toLowerCase().includes(searchTerm.toLowerCase()) &&
				!selectedLocations.includes(location)
			);
			setFilteredLocations(filtered);
		}
	}, [searchTerm, selectedLocations]);

	const handleInputChange = (e) => {
		setSearchTerm(e.target.value);
		setShowDropdown(true);
	};

	const handleLocationSelect = (location) => {
		const updatedLocations = [...selectedLocations, location];
		onChange(updatedLocations);
		setSearchTerm('');
		setShowDropdown(false);
	};

	const removeLocation = (locationToRemove) => {
		const updatedLocations = selectedLocations.filter(loc => loc !== locationToRemove);
		onChange(updatedLocations);
	};

	const handleInputFocus = () => {
		setShowDropdown(true);
	};

	const handleInputBlur = () => {
		setTimeout(() => setShowDropdown(false), 200);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && searchTerm.trim() !== '') {
			e.preventDefault();
			if (!selectedLocations.includes(searchTerm.trim())) {
				handleLocationSelect(searchTerm.trim());
			} else {
				setSearchTerm('');
			}
		} else if (e.key === 'Backspace' && searchTerm === '' && selectedLocations.length > 0) {
			removeLocation(selectedLocations[selectedLocations.length - 1]);
		}
	};

	return (
		<div style={{ position: 'relative' }}>
			<div style={{
				...style,
				display: 'flex',
				flexWrap: 'wrap',
				gap: '8px',
				padding: '8px 12px',
				minHeight: '45px',
				alignItems: 'center',
				cursor: 'text'
			}} onClick={() => document.getElementById('location-input').focus()}>
				{selectedLocations.map((location, index) => (
					<div key={index} style={{
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
						background: '#f3f4f6',
						border: '1px solid #e5e7eb',
						borderRadius: '16px',
						padding: '2px 10px',
						fontSize: '13px',
						color: '#374151'
					}}>
						<span>{location}</span>
						<i 
							className="fa fa-times" 
							style={{ cursor: 'pointer', color: '#9ca3af', fontSize: '11px' }}
							onClick={(e) => {
								e.stopPropagation();
								removeLocation(location);
							}}
						/>
					</div>
				))}
				<input
					id="location-input"
					style={{
						border: 'none',
						outline: 'none',
						flex: 1,
						minWidth: '120px',
						padding: '4px 0',
						fontSize: '14px',
						background: 'transparent'
					}}
					type="text"
					value={searchTerm}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					onKeyDown={handleKeyDown}
					placeholder={selectedLocations.length === 0 ? "Search or select locations..." : ""}
					autoComplete="off"
				/>
				<i 
					className="fa fa-search" 
					style={{
						color: '#9ca3af',
						fontSize: '14px',
						marginLeft: 'auto'
					}}
				/>
			</div>

			{showDropdown && (filteredLocations.length > 0 || searchTerm.trim() !== '') && (
				<div style={{
					position: 'absolute',
					top: '100%',
					left: 0,
					right: 0,
					background: '#fff',
					border: '1px solid #d1d5db',
					borderRadius: '0 0 8px 8px',
					maxHeight: '200px',
					overflowY: 'auto',
					zIndex: 1000,
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					marginTop: '2px'
				}}>
					{filteredLocations.slice(0, 10).map((location, index) => (
						<div
							key={index}
							style={{
								padding: '10px 12px',
								cursor: 'pointer',
								borderBottom: '1px solid #f3f4f6',
								transition: 'background-color 0.2s'
							}}
							onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
							onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
							onMouseDown={(e) => {
								e.preventDefault();
								handleLocationSelect(location);
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<i className="fa fa-map-marker-alt" style={{ color: '#ff6b35', fontSize: '12px' }}></i>
								<span style={{ fontSize: '14px', color: '#374151' }}>{location}</span>
							</div>
						</div>
					))}
					{searchTerm.trim() !== '' && !LOCATION_OPTIONS.some(loc => loc.toLowerCase() === searchTerm.toLowerCase()) && !selectedLocations.includes(searchTerm.trim()) && (
						<div
							style={{
								padding: '10px 12px',
								cursor: 'pointer',
								color: '#ff6b35',
								fontWeight: '500',
								borderBottom: '1px solid #f3f4f6'
							}}
							onMouseDown={(e) => {
								e.preventDefault();
								handleLocationSelect(searchTerm.trim());
							}}
						>
							<i className="fa fa-plus" style={{ marginRight: 8 }}></i>
							Add "{searchTerm}"
						</div>
					)}
					{filteredLocations.length === 0 && searchTerm.trim() === '' && (
						<div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
							All locations selected or none found.
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function EmpPostJob({ onNext }) {
	const { id } = useParams();
	const isEditMode = Boolean(id);
	const [formData, setFormData] = useState({
		jobTitle: "",
		jobLocation: [],
		jobType: "",
		netSalary: "",
		ctc: "",
		vacancies: "",
		applicationLimit: "",
		jobDescription: "",
		rolesAndResponsibilities: "",
		education: [], // dropdown
		backlogsAllowed: false,
		requiredSkills: [],
		skillInput: "",
		experienceLevel: "freshers", // 'freshers' | 'minimum'
		minExperience: "",
		maxExperience: "",
		interviewRoundsCount: "",
		interviewRoundTypes: {
			technical: false,
			managerial: false,
			nonTechnical: false,
			final: false,
			hr: false,
			assessment: false,
			aptitude: false,
			coding: false
		},
		interviewRoundOrder: [],
		interviewRoundDetails: {
			technical: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' },
			nonTechnical: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' },
			managerial: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' },
			final: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' },
			hr: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' },
			assessment: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' },
			aptitude: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' },
			coding: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' }
		},
		offerLetterDate: "",
		joiningDate: "",
		lastDateOfApplication: "",
		lastDateOfApplicationTime: "",
		transportation: {
			oneWay: false,
			twoWay: false,
			noCab: false,
		},
		interviewMode: {
			faceToFace: false,
			phone: false,
			videoCall: false,
			documentVerification: false,
		},
		// Consultant-specific fields
		companyLogo: "",
		companyName: "",
		companyDescription: "",
		aboutCompany: "",
		category: "",
		// Type of Employment
		typeOfEmployment: "",
		// Work Shift
		shift: "",
		// Work Mode
		workMode: ""
	});

	const [employerType, setEmployerType] = useState('company');
	const [logoFile, setLogoFile] = useState(null);
	const [isMobile, setIsMobile] = useState(false);
	const [availableAssessments, setAvailableAssessments] = useState([]);
	const [selectedAssessment, setSelectedAssessment] = useState('');
	const [errors, setErrors] = useState({});
	const [globalErrors, setGlobalErrors] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [scheduledRounds, setScheduledRounds] = useState({});
	const [locationSearchTerm, setLocationSearchTerm] = useState('');
	const [showLocationDropdown, setShowLocationDropdown] = useState(false);
	const [showEducationDropdown, setShowEducationDropdown] = useState(false);
	const [approvedCompanies, setApprovedCompanies] = useState([]);
	const [validationRules] = useState({
		jobTitle: { required: true, minLength: 3 },
		category: { required: true },
		jobType: { required: true },
		typeOfEmployment: { required: true },
		workMode: { required: true },
		shift: { required: true },
		ctc: { required: true },
		netSalary: { required: true },
		jobLocation: { required: true },
		vacancies: { required: true, pattern: /^[1-9]\d*$/, patternMessage: 'Must be a positive number' },
		applicationLimit: { required: true, pattern: /^[1-9]\d*$/, patternMessage: 'Must be a positive number' },
		education: { required: true },
		requiredSkills: { required: true },
		interviewRoundsCount: { required: true, pattern: /^[1-9]\d*$/, patternMessage: 'Must be a positive number' },
		offerLetterDate: { required: true },
		lastDateOfApplication: { required: true },
		jobDescription: { required: true },
		rolesAndResponsibilities: { required: true }
	});

	/* Helpers */
	const update = (patch) => {
		setFormData((s) => ({ ...s, ...patch }));
		// Clear global errors when user makes changes
		if (globalErrors.length > 0) {
			setGlobalErrors([]);
		}
		// Clear field-specific errors
		Object.keys(patch).forEach(field => {
			if (errors[field]) {
				setErrors(prev => {
					const newErrors = { ...prev };
					delete newErrors[field];
					return newErrors;
				});
			}
		});
	};

	// Auto-save CTC to localStorage with debouncing and calculate net salary
	const autoSaveCTC = useCallback((ctcValue) => {
		if (ctcValue && String(ctcValue).trim()) {
			localStorage.setItem('draft_ctc', ctcValue);
			
			// Auto-calculate net salary (approximately 75-80% of CTC)
			const calculateNetSalary = (ctc) => {
				const ctcStr = String(ctc).trim();
				if (!ctcStr) return '';
				
				// Handle range format (e.g., "6-8" or "6-8 L.P.A")
				if (ctcStr.includes('-')) {
					const parts = ctcStr.split('-');
					if (parts.length === 2) {
						const minCTC = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
						const maxCTC = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
						if (!isNaN(minCTC) && !isNaN(maxCTC)) {
							const minNet = Math.round((minCTC * 100000 * 0.77) / 12);
							const maxNet = Math.round((maxCTC * 100000 * 0.77) / 12);
							return `${minNet}-${maxNet}`;
						}
					}
				} else {
					// Handle single value (e.g., "8" or "8 L.P.A")
					const ctcNum = parseFloat(ctcStr.replace(/[^0-9.]/g, ''));
					if (!isNaN(ctcNum)) {
						const monthlyNet = Math.round((ctcNum * 100000 * 0.77) / 12);
						return monthlyNet.toString();
					}
				}
				return '';
			};
			
			const netSalary = calculateNetSalary(ctcValue);
			if (netSalary) {
				update({ netSalary });
			}
		}
	}, []);

	// Debounced auto-save
	useEffect(() => {
		const timer = setTimeout(() => {
			if (formData.ctc) {
				autoSaveCTC(formData.ctc);
			}
		}, 500); // Save after 500ms of no typing

		return () => clearTimeout(timer);
	}, [formData.ctc, autoSaveCTC]);

	useEffect(() => {
		// Reset scroll position
		window.scrollTo(0, 0);
		
		if (isEditMode) {
			fetchJobData();
		} else {
			// Load saved CTC from localStorage for new jobs
			const savedCTC = localStorage.getItem('draft_ctc');
			if (savedCTC) {
				update({ ctc: savedCTC });
			}
		}
		fetchEmployerType();
		fetchAssessments();
		fetchApprovedCompanies();
		
		// Mobile detection
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 767);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, [id, isEditMode]);

	const fetchAssessments = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall('http://localhost:5000/api/employer/assessments', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (data.success) {
				setAvailableAssessments(data.assessments || []);
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			console.error('Failed to fetch assessments:', error);
		}
	};

	const fetchApprovedCompanies = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall('http://localhost:5000/api/employer/approved-authorization-companies', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (data.success) {
				setApprovedCompanies(data.companies || []);
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			console.error('Failed to fetch approved companies:', error);
		}
	};

	const fetchJobData = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall(`http://localhost:5000/api/employer/jobs/${id}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (data.success) {
				const job = data.job;

				// Populate form with job data
				update({
					jobTitle: job.title || '',
					jobLocation: Array.isArray(job.location) ? job.location : (job.location ? [job.location] : []),
					jobType: job.jobType || '',
					netSalary: job.netSalary || '',
					ctc: job.ctc ? (typeof job.ctc === 'object' ? `${job.ctc.min}-${job.ctc.max}` : job.ctc) : '',
					vacancies: job.vacancies || '',
					applicationLimit: job.applicationLimit || '',
					jobDescription: job.description || '',
					rolesAndResponsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
					education: Array.isArray(job.education) ? job.education : (job.education ? [job.education] : []),
					backlogsAllowed: job.backlogsAllowed || false,
					requiredSkills: job.requiredSkills || [],
					experienceLevel: job.experienceLevel || 'freshers',
					minExperience: job.minExperience || '',
					maxExperience: job.maxExperience || '',
					interviewRoundsCount: job.interviewRoundsCount || '',
					interviewRoundTypes: job.interviewRoundTypes || {
						technical: false,
						managerial: false,
						nonTechnical: false,
						final: false,
						hr: false,
					},
					interviewRoundDetails: (() => {
						const details = job.interviewRoundDetails || {};
						// Convert date objects to YYYY-MM-DD format for input fields
						Object.keys(details).forEach(key => {
							if (details[key]) {
								if (details[key].fromDate) {
									details[key].fromDate = new Date(details[key].fromDate).toISOString().split('T')[0];
								}
								if (details[key].toDate) {
									details[key].toDate = new Date(details[key].toDate).toISOString().split('T')[0];
								}
							}
						});
						return details;
					})(),
					interviewRoundOrder: job.interviewRoundOrder || [],
					offerLetterDate: job.offerLetterDate ? job.offerLetterDate.split('T')[0] : '',
					joiningDate: job.joiningDate ? job.joiningDate.split('T')[0] : '',
					lastDateOfApplication: job.lastDateOfApplication ? job.lastDateOfApplication.split('T')[0] : '',
					lastDateOfApplicationTime: job.lastDateOfApplicationTime || '',
					transportation: job.transportation || {
						oneWay: false,
						twoWay: false,
						noCab: false,
					},
					interviewMode: job.interviewMode || {
						faceToFace: false,
						phone: false,
						videoCall: false,
						documentVerification: false,
					},
					companyLogo: job.companyLogo || '',
					companyName: job.companyName || '',
					companyDescription: job.companyDescription || '',
					aboutCompany: job.aboutCompany || '',
					category: job.category || '',
					typeOfEmployment: job.typeOfEmployment || '',
					shift: job.shift || '',
					workMode: job.workMode || ''
				});

				// Set selected assessment
				if (job.assessmentId) {
					setSelectedAssessment(job.assessmentId._id || job.assessmentId);
				}
				
				// Load assessment dates into interview round details if they exist
				if (job.assessmentStartDate) {
					const assessmentRoundKey = job.interviewRoundOrder?.find(key => job.interviewRoundTypes?.[key] === 'assessment');
					if (assessmentRoundKey) {
						setFormData(prev => ({
							...prev,
							interviewRoundDetails: {
								...prev.interviewRoundDetails,
								[assessmentRoundKey]: {
									...prev.interviewRoundDetails[assessmentRoundKey],
									fromDate: job.assessmentStartDate ? new Date(job.assessmentStartDate).toISOString().split('T')[0] : '',
									startTime: job.assessmentStartTime || prev.interviewRoundDetails[assessmentRoundKey]?.startTime || '',
									endTime: job.assessmentEndTime || prev.interviewRoundDetails[assessmentRoundKey]?.endTime || ''
								}
							}
						}));
					}
				}
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			displayError(error, { useToast: true });
		}
	};

	const fetchEmployerType = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const data = await safeApiCall('http://localhost:5000/api/employer/profile', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			
			if (data.success && data.profile?.employerId) {
				const empType = data.profile.employerId.employerType || 'company';
				const empCategory = data.profile.employerCategory;
				
				
				// Check both employerType and employerCategory
				const finalType = (empType === 'consultant' || empCategory === 'consultancy') ? 'consultant' : 'company';
				
				setEmployerType(finalType);
				// For consultants, check if they have default company info in profile
				if (empType === 'consultant' && data.profile.consultantCompanyName) {
					update({
						companyLogo: data.profile.consultantCompanyLogo || '',
						companyName: data.profile.consultantCompanyName || '',
						companyDescription: data.profile.consultantCompanyDescription || '',
						aboutCompany: data.profile.consultantAboutCompany || ''
					});
				}
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			console.error('Failed to fetch employer type:', error);
		}
	};



	/* Skills logic - now handled by dropdown */
	const removeSkill = (skill) =>
		update({
			requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
		});

	const addSkill = () => {};

	/* Toggle nested checkbox groups */
	const toggleNested = (group, key) => {
		if (group === 'interviewRoundTypes') {
			setFormData((s) => {
				const isCurrentlyChecked = s[group][key];
				let newOrder = [...s.interviewRoundOrder];
				
				if (isCurrentlyChecked) {
					// Remove from order if unchecking
					newOrder = newOrder.filter(item => item !== key);
				} else {
					// Add to order if checking
					newOrder.push(key);
				}
				
				return {
					...s,
					[group]: { ...s[group], [key]: !s[group][key] },
					interviewRoundOrder: newOrder
				};
			});
		} else {
			setFormData((s) => ({
				...s,
				[group]: { ...s[group], [key]: !s[group][key] },
			}));
		}
	};

	/* Update interview round details */
	const updateRoundDetails = async (roundType, field, value) => {
		// Validation to ensure rounds are scheduled in order
		if (field === 'fromDate' || field === 'startTime' || field === 'endTime') {
			const currentIndex = formData.interviewRoundOrder.indexOf(roundType);
			
			// Check against previous round
			if (currentIndex > 0) {
				const prevRoundKey = formData.interviewRoundOrder[currentIndex - 1];
				const prevRound = formData.interviewRoundDetails[prevRoundKey];
				
				const currentFromDate = field === 'fromDate' ? value : formData.interviewRoundDetails[roundType].fromDate;
				const currentStartTime = field === 'startTime' ? value : formData.interviewRoundDetails[roundType].startTime;
				
				if (prevRound.fromDate && currentFromDate) {
					if (currentFromDate < prevRound.fromDate) {
						showWarning(`Round ${currentIndex + 1} cannot be scheduled before Round ${currentIndex}. Please select a date on or after ${prevRound.fromDate}.`);
						return;
					}
					
					if (currentFromDate === prevRound.fromDate) {
						// Prioritize check against previous round's "To Time" (endTime)
						const prevCompareTime = prevRound.endTime || prevRound.startTime;
						if (prevCompareTime && currentStartTime && currentStartTime < prevCompareTime) {
							showWarning(`Round ${currentIndex + 1} cannot start before Round ${currentIndex} finishes (ends at ${prevCompareTime}).`);
							return;
						}
						if (prevCompareTime && currentStartTime && currentStartTime === prevCompareTime) {
							showWarning(`Round ${currentIndex + 1} cannot start at the exact same time as Round ${currentIndex} ends (${prevCompareTime}). Please select a later time.`);
							return;
						}
					}
				}
			}
			
			// Check against next round (if user is modifying an earlier round)
			if (currentIndex !== -1 && currentIndex < formData.interviewRoundOrder.length - 1) {
				const nextRoundKey = formData.interviewRoundOrder[currentIndex + 1];
				const nextRound = formData.interviewRoundDetails[nextRoundKey];
				
				const currentFromDate = field === 'fromDate' ? value : formData.interviewRoundDetails[roundType].fromDate;
				const currentEndTime = field === 'endTime' ? value : formData.interviewRoundDetails[roundType].endTime;
				const currentStartTime = field === 'startTime' ? value : formData.interviewRoundDetails[roundType].startTime;
				
				if (nextRound.fromDate && currentFromDate) {
					if (currentFromDate > nextRound.fromDate) {
						showWarning(`Round ${currentIndex + 1} cannot be scheduled after Round ${currentIndex + 2}. Please select a date on or before ${nextRound.fromDate}.`);
						return;
					}
					
					if (currentFromDate === nextRound.fromDate && nextRound.startTime) {
						// For the current round, its end time (or start time if end not set) should be before next round's start time
						const currentCompareTime = currentEndTime || currentStartTime;
						if (currentCompareTime && currentCompareTime > nextRound.startTime) {
							showWarning(`Round ${currentIndex + 1} cannot end after Round ${currentIndex + 2} starts (${nextRound.startTime}).`);
							return;
						}
						if (currentCompareTime && currentCompareTime === nextRound.startTime) {
							showWarning(`Round ${currentIndex + 1} cannot end at the exact same time as Round ${currentIndex + 2} starts (${nextRound.startTime}). Please select an earlier time.`);
							return;
						}
					}
				}
			}

			// Internal validation: End time must be after Start time for the same round
			if (field === 'startTime' || field === 'endTime') {
				const startTime = field === 'startTime' ? value : formData.interviewRoundDetails[roundType].startTime;
				const endTime = field === 'endTime' ? value : formData.interviewRoundDetails[roundType].endTime;
				
				if (startTime && endTime && endTime <= startTime) {
					showWarning(`End time must be after the start time for the same round.`);
					return;
				}
			}
		}

		// Ensure the roundType exists in interviewRoundDetails
		setFormData(s => {
			let updatedValue = value;
			let additionalUpdates = {};

			// Auto-calculate end time for assessments if startTime is changed
			if ((s.interviewRoundTypes[roundType] === 'assessment' || roundType === 'assessment' || String(roundType).startsWith('assessment_')) && field === 'startTime' && value) {
				const currentAssessmentId = selectedAssessment || s.assignedAssessment || s.assessmentId;
				if (currentAssessmentId) {
					const assessment = availableAssessments.find(a => (a._id === currentAssessmentId || a.id === currentAssessmentId));
					const duration = assessment?.timer || assessment?.timeLimit || assessment?.duration || assessment?.totalTime;
					
					if (duration) {
						try {
							const [hours, mins] = value.split(':').map(Number);
							if (!isNaN(hours) && !isNaN(mins)) {
								const date = new Date();
								date.setHours(hours);
								date.setMinutes(mins + parseInt(duration));
								const calculatedEndTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
								additionalUpdates.endTime = calculatedEndTime;
								console.log(`Auto-calculated assessment end time: ${calculatedEndTime} based on ${duration} min duration`);
							}
						} catch (e) {
							console.error('Error calculating end time:', e);
						}
					}
				}
			}

			const updatedDetails = {
				...s.interviewRoundDetails,
				[roundType]: {
					...s.interviewRoundDetails[roundType],
					[field]: updatedValue,
					...additionalUpdates
				}
			};
			
			// Log the update for debugging
			console.log(`Updated ${roundType} ${field}:`, value);
			console.log('Updated interview round details:', updatedDetails);
			
			return {
				...s,
				interviewRoundDetails: updatedDetails
			};
		});

		// Check for holidays when date is selected
		if (field === 'fromDate' && value) {
			const holidayCheck = await holidaysApi.checkHoliday(value);
			if (holidayCheck.success && holidayCheck.isHoliday) {
				showWarning(`Note: ${value} is a public holiday (${holidayCheck.holidayInfo.name}). Consider selecting a different date.`);
			}
		}
	};

	const handleLogoUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				update({ companyLogo: e.target.result });
			};
			reader.readAsDataURL(file);
		}
	};

	const validateJobForm = () => {
		const newErrors = {};
		const errorMessages = [];

		// Basic validation using validation rules
		const basicErrors = validateForm(formData, validationRules);
		Object.assign(newErrors, basicErrors);

		// Custom validation for job title
		if (formData.jobTitle === 'Other - Specify' || (formData.jobTitle && formData.jobTitle.trim().length < 3)) {
			newErrors.jobTitle = ['Please enter a valid job title (minimum 3 characters)'];
		}

		// Custom validation for job category
		if (formData.category === 'Other - Specify' || (formData.category && formData.category.trim().length < 2)) {
			newErrors.category = ['Please enter a valid job category (minimum 2 characters)'];
		}

		// Custom validations
		if (formData.experienceLevel === 'minimum') {
			if (!formData.minExperience || parseInt(formData.minExperience) < 0) {
				newErrors.minExperience = ['Please enter valid minimum experience'];
			}
			if (formData.maxExperience && parseInt(formData.maxExperience) < parseInt(formData.minExperience)) {
				newErrors.maxExperience = ['Maximum experience cannot be less than minimum experience'];
			}
		}

		// Application limit validation removed - employers can set any application limit

		// Validate Interview Rounds Count
		const specifiedRoundsCount = parseInt(formData.interviewRoundsCount) || 0;
		const selectedRoundsCount = formData.interviewRoundOrder.length;
		
		if (specifiedRoundsCount > 0 && selectedRoundsCount !== specifiedRoundsCount) {
			errorMessages.push(`You specified ${specifiedRoundsCount} interview rounds but selected ${selectedRoundsCount} rounds. Please select exactly ${specifiedRoundsCount} interview round(s) to match your specified count.`);
			showError(`Interview rounds mismatch! You specified ${specifiedRoundsCount} rounds but selected ${selectedRoundsCount}. Please adjust your selection.`);
		}

		// Validate Interview Round Details
		const selectedRounds = formData.interviewRoundOrder
			.filter(uniqueKey => formData.interviewRoundTypes[uniqueKey] !== 'assessment');

		for (const uniqueKey of selectedRounds) {
			const roundType = formData.interviewRoundTypes[uniqueKey];
			const details = formData.interviewRoundDetails[uniqueKey];
			const roundNames = {
				technical: 'Technical Round',
				nonTechnical: 'Non-Technical Round',
				managerial: 'Managerial Round',
				final: 'Final Round',
				hr: 'HR Round',
				aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
				coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
			};

			const roundName = roundNames[roundType] || roundType;

			if (!details?.description?.trim()) {
				errorMessages.push(`Please enter description for ${roundName}`);
			}
			if (!details?.fromDate) {
				errorMessages.push(`Please select Date for ${roundName}`);
			}
			if (!details?.startTime) {
				errorMessages.push(`Please select From Time for ${roundName}`);
			}
			if (!details?.endTime) {
				errorMessages.push(`Please select To Time for ${roundName}`);
			}
		}

		// Validate Assessment if selected
		const assessmentKeys = formData.interviewRoundOrder.filter(key => formData.interviewRoundTypes[key] === 'assessment');
		assessmentKeys.forEach((assessmentKey, index) => {
			if (!selectedAssessment) {
				errorMessages.push('Please select an Assessment');
			}
			const assessmentDetails = formData.interviewRoundDetails[assessmentKey];
			if (!assessmentDetails?.fromDate) {
				errorMessages.push(`Please select Date for Assessment ${index + 1}`);
			}
			if (!assessmentDetails?.startTime) {
				errorMessages.push(`Please select Start Time for Assessment ${index + 1}`);
			}
			if (!assessmentDetails?.endTime) {
				errorMessages.push(`Please select End Time for Assessment ${index + 1}`);
			}
		});

		// Validate Last Date of Application vs First Interview Round
		if (formData.lastDateOfApplication) {
			const allRoundDates = [];
			
			// Collect all interview round dates
			formData.interviewRoundOrder.forEach(key => {
				const details = formData.interviewRoundDetails[key];
				if (details?.fromDate) {
					allRoundDates.push(new Date(details.fromDate));
				}
			});
			
			if (allRoundDates.length > 0) {
				const earliestRoundDate = new Date(Math.min(...allRoundDates));
				const lastAppDate = new Date(formData.lastDateOfApplication);
				
				// Calculate difference in days
				const timeDiff = earliestRoundDate.getTime() - lastAppDate.getTime();
				const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
				
				if (dayDiff < 1) {
					newErrors.lastDateOfApplication = ['Last date of application must be at least 1 day before the first interview round'];
					errorMessages.push(`Last date of application (${formData.lastDateOfApplication}) must be at least one day before the first interview round (${earliestRoundDate.toISOString().split('T')[0]})`);
				}
			}
		}

		// Validate Offer Letter Date vs Last Interview Round
		if (formData.offerLetterDate) {
			const allRoundDates = [];
			formData.interviewRoundOrder.forEach(key => {
				const details = formData.interviewRoundDetails[key];
				if (details?.fromDate) {
					allRoundDates.push(new Date(details.fromDate));
				}
			});
			
			if (allRoundDates.length > 0) {
				const latestRoundDate = new Date(Math.max(...allRoundDates));
				const offerDate = new Date(formData.offerLetterDate);
				
				if (offerDate < latestRoundDate) {
					newErrors.offerLetterDate = ['Offer letter date cannot be before the interview rounds'];
					errorMessages.push(`Offer letter date (${formData.offerLetterDate}) must be on or after the last interview round (${latestRoundDate.toISOString().split('T')[0]})`);
				}
			}
		}

		// Validate Joining Date vs Offer Letter Date
		if (formData.joiningDate && formData.offerLetterDate) {
			const joiningDate = new Date(formData.joiningDate);
			const offerDate = new Date(formData.offerLetterDate);
			
			if (joiningDate <= offerDate) {
				newErrors.joiningDate = ['Joining date must be after the offer letter date'];
				errorMessages.push(`Joining date (${formData.joiningDate}) must be after the offer letter date (${formData.offerLetterDate})`);
			}
		}

		// Skip consultant field validation - these are optional
		// Actually, let's add validation for consultant fields since they're marked as required
		if (employerType === 'consultant') {
			if (!formData.companyName || formData.companyName.trim().length < 2) {
				newErrors.companyName = ['Please enter a valid company name (minimum 2 characters)'];
			}
			if (!formData.aboutCompany || formData.aboutCompany.trim().length < 10) {
				newErrors.aboutCompany = ['Please enter about company information (minimum 10 characters)'];
			}
			if (!formData.companyDescription || formData.companyDescription.trim().length < 10) {
				newErrors.companyDescription = ['Please enter why join us information (minimum 10 characters)'];
			}
		}

		// Validate Transportation
		if (!formData.transportation.oneWay && !formData.transportation.twoWay && !formData.transportation.noCab) {
			newErrors.transportation = ['Please select a transportation option'];
		}

		setErrors(newErrors);
		setGlobalErrors(errorMessages);

		return Object.keys(newErrors).length === 0 && errorMessages.length === 0;
	};

	const handleSubmitClick = () => {
		if (isSubmitting) return;
		
		// Validate form first
		if (!validateJobForm()) {
			// Find first error field and scroll to it
			const errorFields = Object.keys(errors);
			if (errorFields.length > 0) {
				const firstErrorField = errorFields[0];
				const fieldElement = document.querySelector(`[name="${firstErrorField}"]`) || 
									 document.querySelector(`input, select, textarea`);
				if (fieldElement) {
					fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
					fieldElement.focus();
				}
			}
			return;
		}
		
		// Show confirmation modal
		setShowConfirmModal(true);
	};
	
	const submitNext = async () => {
		setShowConfirmModal(false);
		
		try {
			const token = localStorage.getItem('employerToken');
			if (!token) {
				showWarning('Please login first');
				return;
			}

			setIsSubmitting(true);

			// Debug logging
			console.log('Frontend - Submitting job with typeOfEmployment:', formData.typeOfEmployment);
			console.log('Frontend - Full jobData being sent:', {
				title: formData.jobTitle,
				category: formData.category,
				typeOfEmployment: formData.typeOfEmployment,
				jobType: formData.jobType
			});

			// Extract assessment dates from interview round details
			const assessmentRoundKey = formData.interviewRoundOrder.find(key => formData.interviewRoundTypes[key] === 'assessment');
			const assessmentDetails = assessmentRoundKey ? formData.interviewRoundDetails[assessmentRoundKey] : null;
			
			// Map interview round details from unique keys to base round types
			const mappedInterviewRoundDetails = {};
			formData.interviewRoundOrder.forEach(uniqueKey => {
				const roundType = formData.interviewRoundTypes[uniqueKey];
				const details = formData.interviewRoundDetails[uniqueKey];
				if (roundType && details) {
					mappedInterviewRoundDetails[uniqueKey] = details;
				}
			});

			const jobData = {
				title: formData.jobTitle,
				location: formData.jobLocation,
				jobType: formData.jobType ? formData.jobType.toLowerCase().replace(/\s+/g, '-') : '',
				ctc: formData.ctc,
				netSalary: formData.netSalary,
				vacancies: parseInt(formData.vacancies) || 0,
				applicationLimit: parseInt(formData.applicationLimit) || 0,
				description: formData.jobDescription || 'Job description to be updated',
				rolesAndResponsibilities: formData.rolesAndResponsibilities || '',
				requiredSkills: formData.requiredSkills,
				experienceLevel: formData.experienceLevel,
				minExperience: formData.minExperience ? parseInt(formData.minExperience) : 0,
				maxExperience: formData.maxExperience ? parseInt(formData.maxExperience) : 0,
				education: formData.education,
				backlogsAllowed: formData.backlogsAllowed,
				interviewRoundsCount: parseInt(formData.interviewRoundsCount) || 0,
				interviewRoundTypes: formData.interviewRoundTypes,
				interviewRoundDetails: mappedInterviewRoundDetails,
				interviewRoundOrder: formData.interviewRoundOrder || [],
				assignedAssessment: selectedAssessment || null,
				assessmentStartDate: assessmentDetails?.fromDate || null,
				assessmentEndDate: assessmentDetails?.fromDate || null,
				assessmentStartTime: assessmentDetails?.startTime || null,
				assessmentEndTime: assessmentDetails?.endTime || null,
				offerLetterDate: formData.offerLetterDate || null,
				lastDateOfApplication: formData.lastDateOfApplication || null,
				lastDateOfApplicationTime: formData.lastDateOfApplicationTime || null,
				transportation: formData.transportation,
				category: formData.category,
				typeOfEmployment: formData.typeOfEmployment,
				shift: formData.shift,
				workMode: formData.workMode,
				companyLogo: formData.companyLogo,
				companyName: formData.companyName,
				companyDescription: formData.companyDescription
			};

			// Add consultant-specific fields if employer is consultant
			if (employerType === 'consultant') {
				console.log('Adding consultant fields:', {
					companyLogo: formData.companyLogo,
					companyName: formData.companyName,
					companyDescription: formData.companyDescription,
					aboutCompany: formData.aboutCompany
				});
				jobData.companyLogo = formData.companyLogo;
				jobData.companyName = formData.companyName;
				jobData.companyDescription = formData.companyDescription;
				jobData.aboutCompany = formData.aboutCompany;
			}

			

			const url = isEditMode 
				? `http://localhost:5000/api/employer/jobs/${id}`
				: 'http://localhost:5000/api/employer/jobs';
			
			const method = isEditMode ? 'PUT' : 'POST';

			const data = await safeApiCall(url, {
				method: method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(jobData)
			});

			if (data.success) {
				// Clear saved CTC from localStorage after successful submission
				localStorage.removeItem('draft_ctc');
				showSuccess(isEditMode ? 'Job updated successfully!' : 'Job posted successfully!');
				setTimeout(() => {
					window.location.href = '/employer/manage-jobs';
				}, 1500);
			} else {
				showError(data.message || `Failed to ${isEditMode ? 'update' : 'post'} job`);
			}
		} catch (error) {
			if (error.name === 'AuthError') {
				showWarning('Session expired. Please login again.');
				localStorage.removeItem('employerToken');
				window.location.href = '/login';
				return;
			}
			
			const errorMessage = getErrorMessage(error, 'profile');
			showError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	/* Inline style objects */
	const page = {
		padding: isMobile ? "10px 10px 15px 10px" : "10px 20px 30px 20px",
		maxWidth: 1200,
		margin: "0 auto",
		fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
		background: "#f8f9fa",
		minHeight: "100vh",
	};
	const card = {
		background: "#fff",
		padding: isMobile ? "16px" : "32px",
		borderRadius: isMobile ? 8 : 12,
		boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
		marginBottom: isMobile ? 16 : 24,
	};
	const heading = {
		margin: 0,
		marginBottom: 8,
		fontSize: 24,
		color: "#1d1d1d",
		fontWeight: 600,
	};
	const sub = { 
		color: "#6b7280", 
		marginBottom: 24, 
		fontSize: 14,
		lineHeight: 1.5,
	};

	const grid = {
		display: "grid",
		gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
		gap: isMobile ? 16 : 24,
		alignItems: "start",
	};
	const fullRow = { gridColumn: "1 / -1" };
	const label = {
		display: "block",
		fontSize: 14,
		color: "#374151",
		marginBottom: 8,
		fontWeight: 500,
	};
	
	// Style for making asterisks red
	const redAsterisk = {
		color: "#dc2626", // Red color for asterisks
		fontWeight: "bold"
	};
	const input = {
		width: "100%",
		padding: isMobile ? "10px 12px" : "12px 14px",
		borderRadius: isMobile ? 6 : 8,
		border: "1px solid #d1d5db",
		background: "#fff",
		outline: "none",
		fontSize: isMobile ? 16 : 14, // Prevents zoom on iOS
		boxSizing: "border-box",
		transition: "all 0.2s ease",
	};
	const inputFocus = {
		borderColor: "#ff6b35",
		boxShadow: "0 0 0 3px rgba(255,107,53,0.1)",
	};
	const smallInput = { ...input, width: 180 };
	const plusBtn = {
		marginLeft: 10,
		width: 42,
		height: 42,
		borderRadius: 8,
		border: "none",
		background: "#ff6b35",
		color: "#fff",
		cursor: "pointer",
		fontSize: 20,
		lineHeight: 1,
		transition: "all 0.2s ease",
		fontWeight: 600,
	};
	const chip = {
		padding: "8px 14px",
		background: "#e7f3ff",
		borderRadius: 20,
		display: "inline-flex",
		gap: 8,
		alignItems: "center",
		fontSize: 13,
		fontWeight: 500,
		color: "#0066cc",
		border: "1px solid #b3d9ff",
	};
	const chipX = {
		marginLeft: 6,
		cursor: "pointer",
		color: "#ef4444",
		fontWeight: 700,
		fontSize: 16,
	};
	const sectionHeader = {
		margin: "40px 0 24px 0",
		fontSize: 20,
		color: "#1f2937",
		fontWeight: 700,
		paddingBottom: 16,
		display: "flex",
		alignItems: "center",
		gap: 12,
		letterSpacing: "-0.025em",
	};

	return (
		<div style={page}>
			{/* Back to Jobs Button */}
			<div style={{marginBottom: 16, display: 'flex', justifyContent: 'flex-end'}}>
				<button
					onClick={() => {
						window.location.href = empRoute(employer.MANAGE_JOBS);
					}}
					style={{
						background: "#374151",
						color: "#ffffff",
						border: "2px solid #9ca3af",
						padding: "10px 20px",
						borderRadius: 8,
						cursor: "pointer",
						fontSize: 14,
						fontWeight: 600,
						transition: "all 0.2s ease",
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
						display: 'flex',
						alignItems: 'center',
						gap: 8,
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#4b5563';
						e.currentTarget.style.borderColor = '#6b7280';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = '#374151';
						e.currentTarget.style.borderColor = '#9ca3af';
					}}
				>
					<i className="fa fa-arrow-left"></i>
					Back to Jobs
				</button>
			</div>

			{/* Header */}
			<div style={{marginBottom: 24}}>
				<h1 style={heading}>
					{isEditMode ? (
						<><i className="fa fa-edit" style={{color: '#ff6b35', marginRight: 12}}></i>Edit Job Posting</>
					) : (
						<><i className="fa fa-plus-circle" style={{color: '#ff6b35', marginRight: 12}}></i>Post a New Job</>
					)}
				</h1>
				<p style={sub}>
					{isEditMode 
						? 'Update your job posting details below. All fields marked with * are required.'
						: 'Fill in the details below to create a new job posting. All fields marked with * are required.'}
				</p>
			</div>





			{/* Card */}
			<div style={card}>
				<div style={grid}>
					{/* Consultant Fields */}
					{employerType === 'consultant' && (
						<>
							<div style={fullRow}>
								<div style={{
									background: 'linear-gradient(135deg, #ee9f27 0%, #ffffff 100%)',
									padding: '16px 20px',
									borderRadius: 10,
									color: '#333',
									marginBottom: 8,
								}}>
									<h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
										<i className="fa fa-briefcase"></i>
										Approved Company Information (Consultant Mode)
									</h4>
									<p style={{margin: '6px 0 0 0', fontSize: 13, opacity: 0.9}}>
										Select from your approved authorization companies
									</p>
								</div>
								<div style={{
									display: 'flex',
									justifyContent: 'flex-start',
									marginBottom: 16
								}}>
									<button
										type="button"
										style={{
											background: '#ff6b35',
											color: 'white',
											border: 'none',
											padding: '10px 20px',
											borderRadius: 8,
											cursor: 'pointer',
											fontSize: 14,
											fontWeight: 600,
											transition: 'all 0.2s ease',
											display: 'flex',
											alignItems: 'center',
											gap: 8
										}}
										onClick={() => {
											window.location.href = '/employer/profile#hiring-companies';
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = '#e55a2b';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = '#ff6b35';
										}}
									>
										<i className="fa fa-plus"></i>
										Add New Company
									</button>
								</div>
							</div>
							<div>
								<label style={label}>
									<i className="fa fa-image" style={{marginRight: '8px', color: '#ff6b35'}}></i>
									Company Logo
								</label>
								<input
									style={{...input, padding: '10px'}}
									type="file"
									accept="image/*"
									onChange={handleLogoUpload}
								/>
								{formData.companyLogo && (
									<div style={{marginTop: 12}}>
										<img 
											src={formData.companyLogo} 
											alt="Company Logo" 
											style={{
												width: '80px', 
												height: '80px', 
												borderRadius: 8,
												objectFit: 'cover',
												border: '2px solid #e5e7eb',
												boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
											}} 
										/>
									</div>
								)}
							</div>
							<div>
								<label style={{...label, color: '#dc2626'}}>
									<i className="fa fa-building" style={{marginRight: '8px'}}></i>
									Company Name <span style={redAsterisk}>*</span>
									<span style={{fontSize: 11, color: '#dc2626', marginLeft: 6}}>(Required)</span>
								</label>
								{approvedCompanies.length > 0 ? (
									<select
										style={{
											...input, 
											borderColor: formData.companyName ? '#10b981' : '#dc2626',
											borderWidth: 2,
											cursor: 'pointer'
										}}
										value={formData.companyName}
										onChange={(e) => update({ companyName: e.target.value })}
										required
									>
										<option value="" disabled>Select Approved Company</option>
										{approvedCompanies.map((company, index) => (
											<option key={index} value={company}>
												{company}
											</option>
										))}
									</select>
								) : (
									<input
										style={{
											...input, 
											borderColor: formData.companyName ? '#10b981' : '#dc2626',
											borderWidth: 2,
										}}
										placeholder="e.g., Tech Solutions Inc."
										value={formData.companyName}
										onChange={(e) => update({ companyName: e.target.value })}
										required
									/>
								)}
								{!formData.companyName && (
									<p style={{color: '#dc2626', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-exclamation-circle"></i>
										{approvedCompanies.length > 0 ? 'Please select an approved company' : 'Please enter company name'}
									</p>
								)}
								{approvedCompanies.length > 0 && (
									<p style={{color: '#10b981', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-check-circle"></i>
										Showing {approvedCompanies.length} approved authorization companies
									</p>
								)}
							</div>
							<div style={fullRow}>
								<label style={{...label, color: '#dc2626'}}>
									<i className="fa fa-info-circle" style={{marginRight: '8px'}}></i>
									Why Join Us <span style={redAsterisk}>*</span>
									<span style={{fontSize: 11, color: '#dc2626', marginLeft: 6}}>(Required)</span>
								</label>
								<textarea
									style={{
										...input, 
										minHeight: '100px',
										borderColor: formData.companyDescription ? '#10b981' : '#dc2626',
										borderWidth: 2,
									}}
									placeholder="Describe the company culture, benefits, growth opportunities, and what makes it unique..."
									value={formData.companyDescription}
									onChange={(e) => update({ companyDescription: e.target.value })}
									required
								/>
								{!formData.companyDescription && (
									<p style={{color: '#dc2626', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-exclamation-circle"></i>
										Please enter why join us information
									</p>
								)}
							</div>
							<div style={fullRow}>
								<label style={{...label, color: '#dc2626'}}>
									<i className="fa fa-building" style={{marginRight: '8px'}}></i>
									About Company <span style={redAsterisk}>*</span>
									<span style={{fontSize: 11, color: '#dc2626', marginLeft: 6}}>(Required)</span>
								</label>
								<textarea
									style={{
										...input, 
										minHeight: '100px',
										borderColor: formData.aboutCompany ? '#10b981' : '#dc2626',
										borderWidth: 2,
									}}
									placeholder="Brief description about the company, its history, mission, and what it does..."
									value={formData.aboutCompany}
									onChange={(e) => update({ aboutCompany: e.target.value })}
									required
								/>
								{!formData.aboutCompany && (
									<p style={{color: '#dc2626', fontSize: 12, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: 4}}>
										<i className="fa fa-exclamation-circle"></i>
										Please enter about company information
									</p>
								)}
							</div>
						</>
					)}

					{/* Basic Job Information Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-info-circle" style={{color: '#ff6b35'}}></i>
							Basic Job Information
						</h3>
					</div>

					{/* Row 1 */}
					<div>
						<label style={label}>
							<i className="fa fa-briefcase" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Title / Designation <span style={redAsterisk}>*</span>
						</label>
						<div style={{position: 'relative'}}>
							<select
								style={{
									...input,
									borderColor: errors.jobTitle ? '#dc2626' : '#d1d5db',
									cursor: 'pointer'
								}}
								className={errors.jobTitle ? 'is-invalid' : ''}
								value={PREDEFINED_JOB_TITLES.includes(formData.jobTitle) ? formData.jobTitle : (formData.jobTitle === '' ? '' : 'Other - Specify')}
								onChange={(e) => {
									if (e.target.value === 'Other - Specify') {
										update({ jobTitle: 'Other - Specify' });
									} else {
										update({ jobTitle: e.target.value });
									}
								}}
							>
								<option value="" disabled>Select Job Title</option>
								{PREDEFINED_JOB_TITLES.map(title => (
									<option key={title} value={title}>{title}</option>
								))}
								<option value="Other - Specify">Other - Specify</option>
							</select>
						</div>
						{(formData.jobTitle === 'Other - Specify' || (formData.jobTitle !== '' && !PREDEFINED_JOB_TITLES.includes(formData.jobTitle))) && (
							<div style={{marginTop: 8}}>
								<input
									style={{
										...input,
										borderColor: '#ff6b35',
										background: '#fff5f2'
									}}
									type="text"
									placeholder="Please enter your custom job title"
									value={formData.jobTitle === 'Other - Specify' ? '' : formData.jobTitle}
									onChange={(e) => update({ jobTitle: e.target.value })}
								/>
								<small style={{color: '#ff6b35', fontSize: 12, marginTop: 4, display: 'block'}}>
									<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
									Enter your custom job title above
								</small>
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Select from common job titles or choose "Other - Specify" to enter a custom title
						</small>
						{errors.jobTitle && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.jobTitle[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-tags" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Category <span style={redAsterisk}>*</span>
						</label>
						<select
							style={{ 
								...input, 
								cursor: 'pointer',
								borderColor: errors.category ? '#dc2626' : '#d1d5db'
							}}
							className={errors.category ? 'is-invalid' : ''}
							value={PREDEFINED_CATEGORIES.includes(formData.category) ? formData.category : (formData.category === '' ? '' : 'Other - Specify')}
							onChange={(e) => {
								if (e.target.value === 'Other - Specify') {
									update({ category: 'Other - Specify' });
								} else {
									update({ category: e.target.value });
								}
							}}
						>
							<option value="" disabled>Select Category</option>
							{PREDEFINED_CATEGORIES.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
							<option value="Other - Specify">Other - Specify</option>
						</select>
						{(formData.category === 'Other - Specify' || (formData.category !== '' && !PREDEFINED_CATEGORIES.includes(formData.category))) && (
							<div style={{marginTop: 8}}>
								<input
									style={{
										...input,
										borderColor: '#ff6b35',
										background: '#fff5f2'
									}}
									type="text"
									placeholder="Please enter your custom job category"
									value={formData.category === 'Other - Specify' ? '' : formData.category}
									onChange={(e) => update({ category: e.target.value })}
								/>
								<small style={{color: '#ff6b35', fontSize: 12, marginTop: 4, display: 'block'}}>
									<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
									Enter your custom job category above
								</small>
							</div>
						)}
						{errors.category && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.category[0]}
							</div>
						)}
					</div>

					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-home" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Work Mode <span style={redAsterisk}>*</span>
						</label>
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
							gap: 8,
							padding: 12,
							border: errors.workMode ? '1px solid #dc2626' : '1px solid #d1d5db',
							borderRadius: 8,
							background: '#fff'
						}}>
							{[
								{ value: 'work-from-home', label: 'Work from Home' },
								{ value: 'work-from-office', label: 'Work from Office' },
								{ value: 'hybrid', label: 'Hybrid' }
							].map(workMode => (
								<label key={workMode.value} style={{
									display: 'flex',
									alignItems: 'center',
									gap: 6,
									cursor: 'pointer',
									fontSize: 13,
									padding: '6px 8px',
									borderRadius: 4,
									transition: 'background 0.2s',
									background: formData.workMode === workMode.value ? '#fff5f2' : 'transparent'
								}}>
									<input
										type="radio"
										name="workMode"
										value={workMode.value}
										checked={formData.workMode === workMode.value}
										onChange={(e) => update({ workMode: e.target.value })}
										style={{cursor: 'pointer'}}
									/>
									<span>{workMode.label}</span>
								</label>
							))}
						</div>
						{errors.workMode && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.workMode[0]}
							</div>
						)}
					</div>

					{/* Transportation */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-car" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Transportation Options <span style={redAsterisk}>*</span>
						</label>
						<div style={{
							display: "grid",
							gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
							gap: 12,
							padding: 12,
							border: errors.transportation ? '1px solid #dc2626' : '1px solid #d1d5db',
							borderRadius: 8,
							background: '#fff'
						}}>
							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 8,
								cursor: 'pointer',
								fontSize: 14,
								padding: '8px 10px',
								borderRadius: 4,
								background: formData.transportation.oneWay ? '#fff5f2' : 'transparent',
								transition: 'background 0.2s'
							}}>
								<input
									type="radio"
									name="transportation"
									value="oneWay"
									checked={formData.transportation.oneWay}
									onChange={() => update({ transportation: { oneWay: true, twoWay: false, noCab: false } })}
									style={{cursor: 'pointer'}}
								/>
								<span>One-way Cab</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 8,
								cursor: 'pointer',
								fontSize: 14,
								padding: '8px 10px',
								borderRadius: 4,
								background: formData.transportation.twoWay ? '#fff5f2' : 'transparent',
								transition: 'background 0.2s'
							}}>
								<input
									type="radio"
									name="transportation"
									value="twoWay"
									checked={formData.transportation.twoWay}
									onChange={() => update({ transportation: { oneWay: false, twoWay: true, noCab: false } })}
									style={{cursor: 'pointer'}}
								/>
								<span>Two-way Cab</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 8,
								cursor: 'pointer',
								fontSize: 14,
								padding: '8px 10px',
								borderRadius: 4,
								background: formData.transportation.noCab ? '#fff5f2' : 'transparent',
								transition: 'background 0.2s'
							}}>
								<input
									type="radio"
									name="transportation"
									value="noCab"
									checked={formData.transportation.noCab}
									onChange={() => update({ transportation: { oneWay: false, twoWay: false, noCab: true } })}
									style={{cursor: 'pointer'}}
								/>
								<span>No Cab Facility</span>
							</label>
						</div>
						{errors.transportation && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.transportation[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-clock" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Type <span style={redAsterisk}>*</span>
						</label>
						<select
							style={{ 
								...input, 
								cursor: 'pointer',
								borderColor: errors.jobType ? '#dc2626' : '#d1d5db'
							}}
							className={errors.jobType ? 'is-invalid' : ''}
							value={formData.jobType}
							onChange={(e) => update({ jobType: e.target.value })}
						>
							<option value="" disabled>Select Job Type</option>
							<option>Full-Time</option>
							<option>Part-Time</option>
							<option>Remote</option>
							<option>Hybrid</option>
							<option>Contract</option>
							<option>Freelance</option>
							<option>Temporary</option>
							<option>Permanent</option>
							<option>Apprenticeship</option>
							<option>Consultant</option>
						</select>
						{errors.jobType && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.jobType[0]}
							</div>
						)}
					</div>

					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-briefcase" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Type of Employment <span style={redAsterisk}>*</span>
						</label>
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
							gap: 8,
							padding: 12,
							border: errors.typeOfEmployment ? '1px solid #dc2626' : '1px solid #d1d5db',
							borderRadius: 8,
							background: '#fff'
						}}>
							{[
								{ value: 'permanent', label: 'Permanent' },
								{ value: 'temporary', label: 'Temporary' },
								{ value: 'freelance', label: 'Freelance' },
								{ value: 'consultant', label: 'Consultant' },
								{ value: 'trainee', label: 'Trainee' }
							].map(empType => (
								<label key={empType.value} style={{
									display: 'flex',
									alignItems: 'center',
									gap: 6,
									cursor: 'pointer',
									fontSize: 13,
									padding: '6px 8px',
									borderRadius: 4,
									transition: 'background 0.2s',
									background: formData.typeOfEmployment === empType.value ? '#fff5f2' : 'transparent'
								}}>
									<input
										type="radio"
										name="typeOfEmployment"
										value={empType.value}
										checked={formData.typeOfEmployment === empType.value}
										onChange={(e) => update({ typeOfEmployment: e.target.value })}
										style={{cursor: 'pointer'}}
									/>
									<span>{empType.label}</span>
								</label>
							))}
						</div>
						{errors.typeOfEmployment && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.typeOfEmployment[0]}
							</div>
						)}
					</div>

					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-clock" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Work Shift <span style={redAsterisk}>*</span>
						</label>
						<div style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
							gap: 8,
							padding: 12,
							border: errors.shift ? '1px solid #dc2626' : '1px solid #d1d5db',
							borderRadius: 8,
							background: '#fff'
						}}>
							{[
								{ value: 'day-shift', label: 'Day Shift' },
								{ value: 'night-shift', label: 'Night Shift' },
								{ value: 'rotational', label: 'Rotational' }
							].map(shift => (
								<label key={shift.value} style={{
									display: 'flex',
									alignItems: 'center',
									gap: 6,
									cursor: 'pointer',
									fontSize: 13,
									padding: '6px 8px',
									borderRadius: 4,
									transition: 'background 0.2s',
									background: formData.shift === shift.value ? '#fff5f2' : 'transparent'
								}}>
									<input
										type="radio"
										name="shift"
										value={shift.value}
										checked={formData.shift === shift.value}
										onChange={(e) => update({ shift: e.target.value })}
										style={{cursor: 'pointer'}}
									/>
									<span>{shift.label}</span>
								</label>
							))}
						</div>
						{errors.shift && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.shift[0]}
							</div>
						)}
					</div>

					{/* Row 2 */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-map-marker-alt" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Location <span style={redAsterisk}>*</span>
						</label>
						<LocationSearchInput
							value={formData.jobLocation}
							onChange={(value) => update({ jobLocation: value })}
							error={errors.jobLocation}
							style={{
								...input,
								borderColor: errors.jobLocation ? '#dc2626' : '#d1d5db'
							}}
						/>
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
							Start typing to search locations or select from dropdown. You can also enter custom locations.
						</small>
						{errors.jobLocation && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.jobLocation[0]}
							</div>
						)}
					</div>

					{/* Compensation Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-money-bill-wave" style={{color: '#ff6b35'}}></i>
							Compensation & Openings
						</h3>
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-rupee-sign" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							CTC (Annual) <span style={redAsterisk}>*</span>
						</label>
						<input
							style={{
								...input,
								borderColor: errors.ctc ? '#dc2626' : '#d1d5db'
							}}
							className={errors.ctc ? 'is-invalid' : ''}
							placeholder="e.g., 8 L.P.A or 6-8 L.P.A"
							value={formData.ctc}
							onChange={(e) => {
								const value = e.target.value;
								update({ ctc: value });
								// Trigger auto-calculation immediately
								if (value.trim()) {
									autoSaveCTC(value);
								}
							}}
						/>
						{errors.ctc && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.ctc[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Enter annual CTC in lakhs (e.g., 8 or 6-8) - Net salary will auto-calculate
						</small>
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-money-bill-wave" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Net Salary (Monthly) <span style={redAsterisk}>*</span>
							{formData.netSalary && (
								<span style={{
									fontSize: 11, 
									color: '#10b981', 
									fontWeight: 500,
									marginLeft: 8,
									background: '#d1fae5',
									padding: '2px 8px',
									borderRadius: 4,
								}}>
									✓ Auto-calculated
								</span>
							)}
						</label>
						<input
							style={{
								...input,
								borderColor: errors.netSalary ? '#dc2626' : (formData.netSalary ? '#10b981' : '#d1d5db'),
								background: formData.netSalary ? '#f0fdf4' : '#fff'
							}}
							className={errors.netSalary ? 'is-invalid' : ''}
							placeholder="Auto-calculated from CTC"
							value={formData.netSalary}
							onChange={(e) => update({ netSalary: e.target.value })}
						/>
						{errors.netSalary && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.netSalary[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Auto-calculated as ~77% of CTC (monthly take-home). You can edit if needed.
						</small>
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-users" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Number of Vacancies <span style={redAsterisk}>*</span>
						</label>
						<input
							style={{
								...input,
								borderColor: errors.vacancies ? '#dc2626' : '#d1d5db'
							}}
							className={errors.vacancies ? 'is-invalid' : ''}
							type="number"
							min="1"
							placeholder="e.g., 5"
							value={formData.vacancies}
							onChange={(e) => {
								const vacancies = parseInt(e.target.value) || 0;
								const applicationLimit = parseInt(formData.applicationLimit) || 0;
								
								update({ vacancies: e.target.value });
								
								// Auto-suggest application limit based on vacancies
								if (vacancies > 0) {
									const suggestedLimit = vacancies * 10; // 10x the vacancies as suggestion
									update({ applicationLimit: suggestedLimit.toString() });
								}
								
								// Check if application limit is less than vacancies after updating vacancies
								if (vacancies > 0 && applicationLimit > 0 && applicationLimit < vacancies) {
									showWarning(`Warning: Your application limit (${applicationLimit}) is now less than the number of vacancies (${vacancies}). Please update the application limit to at least ${vacancies}.`);
								}
							}}
						/>
						{errors.vacancies && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.vacancies[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-file-alt" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Application Limit <span style={redAsterisk}>*</span>
						</label>
						<input
							style={{
								...input,
								borderColor: errors.applicationLimit ? '#dc2626' : '#d1d5db'
							}}
							className={errors.applicationLimit ? 'is-invalid' : ''}
							type="number"
							min="1"
							placeholder="e.g., 100"
							value={formData.applicationLimit}
							onChange={(e) => {
								const applicationLimit = parseInt(e.target.value) || 0;
								const vacancies = parseInt(formData.vacancies) || 0;
								
								// Check if application limit is less than vacancies
								if (applicationLimit > 0 && vacancies > 0 && applicationLimit < vacancies) {
									showError(`Application limit (${applicationLimit}) cannot be less than number of vacancies (${vacancies}). Please set application limit to at least ${vacancies}.`);
									return; // Don't update the value
								}
								
								update({ applicationLimit: e.target.value });
							}}
						/>
						{errors.applicationLimit && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.applicationLimit[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Maximum number of applications to accept (must be at least equal to number of vacancies)
						</small>
					</div>

					{/* Requirements Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-clipboard-check" style={{color: '#ff6b35'}}></i>
							Requirements & Qualifications
						</h3>
					</div>

					<div style={{ position: 'relative' }}>
						<label style={label}>
							<i className="fa fa-graduation-cap" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Required Educational Background <span style={redAsterisk}>*</span>
						</label>
						<div 
							onClick={() => setShowEducationDropdown(!showEducationDropdown)}
							style={{
								...input,
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								cursor: 'pointer',
								minHeight: '45px',
								height: 'auto',
								padding: '8px 12px'
							}}
						>
							<div style={{ 
								display: 'flex', 
								flexWrap: 'wrap', 
								gap: '4px',
								fontSize: '14px',
								color: formData.education.length > 0 ? '#111827' : '#9ca3af'
							}}>
								{formData.education.length > 0 
									? formData.education.join(", ") 
									: "Select educational background..."}
							</div>
							<i className={`fa fa-chevron-${showEducationDropdown ? 'up' : 'down'}`} style={{ color: '#6b7280', fontSize: '12px' }}></i>
						</div>

						{showEducationDropdown && (
							<>
								<div 
									style={{
										position: 'fixed',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										zIndex: 999
									}}
									onClick={() => setShowEducationDropdown(false)}
								/>
								<div style={{
									position: 'absolute',
									top: '100%',
									left: 0,
									right: 0,
									zIndex: 1000,
									marginTop: '4px',
									display: 'flex',
									flexDirection: 'column',
									gap: '4px',
									padding: '12px',
									background: '#fff',
									borderRadius: '8px',
									border: '1px solid #d1d5db',
									boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
									maxHeight: '300px',
									overflowY: 'auto'
								}}>
									{["Any", "10th Pass", "12th Pass", "Diploma", "B.E", "B.Tech", "B.Sc", "BCA", "BBA", "B.Com", "BA", "M.E", "M.Tech", "M.Sc", "MCA", "MBA", "M.Com", "MA", "PhD"].map(level => (
										<label key={level} style={{
											display: 'flex',
											alignItems: 'center',
											gap: '12px',
											cursor: 'pointer',
											fontSize: '14px',
											color: '#374151',
											margin: 0,
											padding: '8px 4px',
											borderRadius: '4px',
											transition: 'background 0.2s'
										}}
										onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
										onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
										>
											<input
												type="checkbox"
												name="education_checkbox"
												checked={formData.education.includes(level)}
												onChange={(e) => {
													const isChecked = e.target.checked;
													let newEducation;
													if (level === "Any") {
														newEducation = isChecked ? ["Any"] : [];
													} else {
														newEducation = isChecked 
															? [...formData.education.filter(edu => edu !== "Any"), level]
															: formData.education.filter(edu => edu !== level);
													}
													update({ education: newEducation });
												}}
												style={{ 
													width: '18px', 
													height: '18px', 
													cursor: 'pointer',
													accentColor: '#ff6b35'
												}}
											/>
											{level}
										</label>
									))}
								</div>
							</>
						)}
						{errors.education && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.education[0]}
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-question-circle" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Are Backlogs Allowed?
						</label>
						<select
							style={{ ...input, cursor: 'pointer' }}
							value={formData.backlogsAllowed ? "Yes" : "No"}
							onChange={(e) =>
								update({ backlogsAllowed: e.target.value === "Yes" })
							}
						>
							<option value="No">No</option>
							<option value="Yes">Yes</option>
						</select>
					</div>

					{/* Skills (full width) */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-cogs" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Required Skills <span style={redAsterisk}>*</span>
							<span style={{fontSize: 12, color: '#6b7280', fontWeight: 'normal', marginLeft: 8}}>
								({formData.requiredSkills.length} skills selected)
							</span>
						</label>
						<div style={{display: 'flex', gap: 8, alignItems: 'flex-start'}}>
							<div style={{position: 'relative', flex: 1}}>
								<input
									style={input}
									type="text"
									placeholder="Type to search or add custom skill..."
									value={formData.skillInput}
									onChange={(e) => update({ skillInput: e.target.value })}
									onFocus={() => update({ skillInput: formData.skillInput || '' })}
									onKeyPress={(e) => {
										if (e.key === 'Enter' && formData.skillInput.trim()) {
											e.preventDefault();
											const newSkill = formData.skillInput.trim();
											if (!formData.requiredSkills.includes(newSkill)) {
												update({ 
													requiredSkills: [...formData.requiredSkills, newSkill],
													skillInput: ''
												});
											}
										}
									}}
								/>
							{formData.skillInput && (() => {
								const allSkills = [
									"React", "Vue.js", "Angular", "Node.js", "Python", "Java", "C++", "C#", "PHP", "Ruby",
									"Go", "Rust", "Swift", "Kotlin", "TypeScript", "JavaScript", "HTML", "CSS", "SASS", "LESS",
									"SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "Oracle", "SQLite",
									"AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub", "GitLab",
									"REST API", "GraphQL", "SOAP", "Microservices", "Spring Boot", "Django", "Flask", "Express.js",
									"Machine Learning", "Deep Learning", "Data Science", "AI", "TensorFlow", "PyTorch", "Pandas", "NumPy",
									"DevOps", "CI/CD", "Agile", "Scrum", "Jira", "Confluence", "Linux", "Unix", "Windows Server",
									"Networking", "Security", "Cybersecurity", "Penetration Testing", "Ethical Hacking",
									"Salesforce", "SAP", "Oracle ERP", "Power BI", "Tableau", "Excel", "Data Analysis",
									"UI/UX Design", "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign",
									"Digital Marketing", "SEO", "SEM", "Content Writing", "Social Media Marketing", "Email Marketing",
									"Project Management", "Product Management", "Business Analysis", "Financial Analysis",
									"Communication", "Leadership", "Team Management", "Problem Solving", "Critical Thinking"
								];
								const filtered = allSkills.filter(skill => 
									skill.toLowerCase().includes(formData.skillInput.toLowerCase()) &&
									!formData.requiredSkills.includes(skill)
								);
								return filtered.length > 0 ? (
									<div style={{
										position: 'absolute',
										top: '100%',
										left: 0,
										right: 0,
										background: '#fff',
										border: '1px solid #d1d5db',
										borderTop: 'none',
										borderRadius: '0 0 8px 8px',
										maxHeight: '200px',
										overflowY: 'auto',
										zIndex: 1000,
										boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
									}}>
										{filtered.slice(0, 10).map((skill, index) => (
											<div
												key={index}
												style={{
													padding: '10px 12px',
													cursor: 'pointer',
													borderBottom: index < Math.min(filtered.length, 10) - 1 ? '1px solid #f3f4f6' : 'none',
													transition: 'background-color 0.2s'
												}}
												onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
												onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
												onClick={() => {
													update({ 
														requiredSkills: [...formData.requiredSkills, skill],
														skillInput: ''
													});
												}}
											>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
													<i className="fa fa-plus-circle" style={{ color: '#ff6b35', fontSize: '12px' }}></i>
													<span style={{ fontSize: '14px', color: '#374151' }}>{skill}</span>
												</div>
											</div>
										))}
										{filtered.length > 10 && (
											<div style={{
												padding: '8px 12px',
												background: '#f9fafb',
												color: '#6b7280',
												fontSize: '12px',
												textAlign: 'center',
												borderTop: '1px solid #e5e7eb'
											}}>
												+{filtered.length - 10} more skills. Keep typing to narrow down...
											</div>
										)}
									</div>
								) : null;
							})()}
							</div>
							<button
								style={{
									background: '#ff6b35',
									color: '#fff',
									border: 'none',
									padding: '12px 16px',
									borderRadius: 8,
									cursor: formData.skillInput.trim() ? 'pointer' : 'not-allowed',
									fontSize: '14px',
									fontWeight: 600,
									opacity: formData.skillInput.trim() ? 1 : 0.5,
									transition: 'all 0.2s',
									whiteSpace: 'nowrap'
								}}
								onClick={() => {
									if (formData.skillInput.trim()) {
										const newSkill = formData.skillInput.trim();
										if (!formData.requiredSkills.includes(newSkill)) {
											update({ 
												requiredSkills: [...formData.requiredSkills, newSkill],
												skillInput: ''
											});
										}
									}
								}}
								onMouseEnter={(e) => {
									if (formData.skillInput.trim()) {
										e.currentTarget.style.background = '#e55a2b';
									}
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = '#ff6b35';
								}}
							>
								<i className="fa fa-plus" style={{marginRight: 4}}></i>
								Add
							</button>
						</div>
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							<i className="fa fa-info-circle" style={{marginRight: 4}}></i>
							Type to search from 90+ skills, select from dropdown, or press Enter/click Add button to add custom skills
						</small>
						{formData.requiredSkills.length > 0 && (
							<div
								style={{
									marginTop: 14,
									display: "flex",
									gap: 10,
									flexWrap: "wrap",
									padding: 12,
									background: '#f9fafb',
									borderRadius: 8,
									border: '1px solid #e5e7eb',
								}}
							>
								{formData.requiredSkills.map((s, i) => (
									<div key={i} style={chip}>
										<span>{s}</span>
										<span 
											style={chipX} 
											onClick={() => removeSkill(s)}
											title="Remove skill"
										>
											×
										</span>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Experience Level */}
					<div style={{
						padding: 20,
						background: '#fff',
						border: '2px solid #e5e7eb',
						borderRadius: 12,
						boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
					}}>
						<label style={{
							...label,
							fontSize: 16,
							fontWeight: 600,
							marginBottom: 16,
							color: '#1f2937'
						}}>
							<i className="fa fa-chart-line" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Experience Level
						</label>
						<div style={{
							display: 'grid',
							gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
							gap: 16,
							marginBottom: 16
						}}>
							<div 
								style={{
									padding: 16,
									border: formData.experienceLevel === "freshers" ? '3px solid #ff6b35' : '2px solid #d1d5db',
									borderRadius: 12,
									background: formData.experienceLevel === "freshers" ? '#fff5f2' : '#ffffff',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
									boxShadow: formData.experienceLevel === "freshers" ? '0 4px 12px rgba(255,107,53,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
									textAlign: 'center'
								}}
								onClick={() => update({ experienceLevel: "freshers", minExperience: "", maxExperience: "" })}
							>

								<h4 style={{
									margin: 0,
									fontSize: 16,
									fontWeight: 600,
									color: formData.experienceLevel === "freshers" ? '#1f2937' : '#6b7280'
								}}>Fresher</h4>
							</div>

							<div 
								style={{
									padding: 16,
									border: formData.experienceLevel === "minimum" ? '3px solid #ff6b35' : '2px solid #d1d5db',
									borderRadius: 12,
									background: formData.experienceLevel === "minimum" ? '#fff5f2' : '#ffffff',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
									boxShadow: formData.experienceLevel === "minimum" ? '0 4px 12px rgba(255,107,53,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
									textAlign: 'center'
								}}
								onClick={() => update({ experienceLevel: "minimum" })}
							>

								<h4 style={{
									margin: 0,
									fontSize: 16,
									fontWeight: 600,
									color: formData.experienceLevel === "minimum" ? '#1f2937' : '#6b7280'
								}}>Experienced</h4>
							</div>

							<div 
								style={{
									padding: 16,
									border: formData.experienceLevel === "both" ? '3px solid #ff6b35' : '2px solid #d1d5db',
									borderRadius: 12,
									background: formData.experienceLevel === "both" ? '#fff5f2' : '#ffffff',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
									boxShadow: formData.experienceLevel === "both" ? '0 4px 12px rgba(255,107,53,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
									textAlign: 'center'
								}}
								onClick={() => update({ experienceLevel: "both", minExperience: "", maxExperience: "" })}
							>

								<h4 style={{
									margin: 0,
									fontSize: 16,
									fontWeight: 600,
									color: formData.experienceLevel === "both" ? '#1f2937' : '#6b7280'
								}}>Both</h4>
							</div>
						</div>

						{formData.experienceLevel === "minimum" && (
							<div style={{
								padding: 16,
								background: '#f0f9ff',
								border: '1px solid #0ea5e9',
								borderRadius: 8,
								display: 'grid',
								gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
								gap: 16
							}}>
								<div>
									<label style={{
										display: 'block',
										fontSize: 14,
										color: '#0f172a',
										fontWeight: 600,
										marginBottom: 8
									}}>Minimum Years</label>
									<input
										style={{
											...input,
											width: '100%',
											marginBottom: 0,
											border: '2px solid #0ea5e9',
											fontWeight: 600,
											fontSize: 16
										}}
										type="number"
										min="0"
										placeholder="e.g., 2"
										value={formData.minExperience}
										onChange={(e) => update({ minExperience: e.target.value })}
									/>
								</div>
								<div>
									<label style={{
										display: 'block',
										fontSize: 14,
										color: '#0f172a',
										fontWeight: 600,
										marginBottom: 8
									}}>Maximum Years</label>
									<input
										style={{
											...input,
											width: '100%',
											marginBottom: 0,
											border: '2px solid #0ea5e9',
											fontWeight: 600,
											fontSize: 16
										}}
										type="number"
										min="0"
										placeholder="e.g., 5"
										value={formData.maxExperience}
										onChange={(e) => update({ maxExperience: e.target.value })}
									/>
								</div>
							</div>
						)}
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-comments" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Number of Interview Rounds <span style={redAsterisk}>*</span>
							{formData.interviewRoundsCount && formData.interviewRoundOrder.length > 0 && (
								<span style={{
									fontSize: 11,
									color: parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length ? '#10b981' : '#ef4444',
									fontWeight: 500,
									marginLeft: 8,
									background: parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length ? '#d1fae5' : '#fee2e2',
									padding: '2px 8px',
									borderRadius: 4,
								}}>
									{parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length 
										? `✓ ${formData.interviewRoundOrder.length} rounds selected` 
										: `⚠ ${formData.interviewRoundOrder.length}/${formData.interviewRoundsCount} selected`
									}
								</span>
							)}
						</label>
						<input
							style={{
								...input,
								borderColor: formData.interviewRoundsCount && formData.interviewRoundOrder.length > 0 
									? (parseInt(formData.interviewRoundsCount) === formData.interviewRoundOrder.length ? '#10b981' : '#ef4444')
									: '#d1d5db'
							}}
							type="number"
							min="1"
							placeholder="e.g., 3"
							value={formData.interviewRoundsCount}
							onChange={(e) => {
								const newCount = e.target.value;
								update({ interviewRoundsCount: newCount });
								
								// Show validation message if there's a mismatch
								if (newCount && formData.interviewRoundOrder.length > 0) {
									const specifiedCount = parseInt(newCount);
									const selectedCount = formData.interviewRoundOrder.length;
									
									if (specifiedCount !== selectedCount) {
										showWarning(`You need to select exactly ${specifiedCount} interview rounds. Currently ${selectedCount} rounds are selected.`);
									}
								}
							}}
						/>
						{errors.interviewRoundsCount && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.interviewRoundsCount[0]}
							</div>
						)}
						{formData.interviewRoundsCount && formData.interviewRoundOrder.length > 0 && parseInt(formData.interviewRoundsCount) !== formData.interviewRoundOrder.length && (
							<div style={{color: '#ef4444', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-triangle"></i>
								Please select exactly {formData.interviewRoundsCount} interview rounds to match your specified count.
							</div>
						)}
					</div>

					{/* Interview Process Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-clipboard-list" style={{color: '#ff6b35'}}></i>
							Interview Process
						</h3>
					</div>

					{/* Interview Round Types - full row */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-list-check" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Select Interview Round Type
							<span style={{fontSize: 12, color: '#6b7280', fontWeight: 'normal', marginLeft: 8}}>
								(You can select the same type multiple times)
								{formData.interviewRoundsCount && (
									<span style={{color: '#ff6b35', fontWeight: 600, marginLeft: 8}}>
										- Select exactly {formData.interviewRoundsCount} rounds
									</span>
								)}
							</span>
						</label>
						<select
							style={{ ...input, cursor: 'pointer' }}
							value=""
							onChange={(e) => {
								const roundType = e.target.value;
								if (roundType) {
									// Check if adding this round would exceed the specified count
									const specifiedCount = parseInt(formData.interviewRoundsCount) || 0;
									const currentCount = formData.interviewRoundOrder.length;
									
									if (specifiedCount > 0 && currentCount >= specifiedCount) {
										showError(`Cannot add more rounds! You specified ${specifiedCount} interview rounds and have already selected ${currentCount}. Please increase the "Number of Interview Rounds" field if you need more rounds.`);
										return;
									}
									
									// Generate unique key for multiple instances
									const uniqueKey = `${roundType}_${Date.now()}`;
									
									// Add to interview round order
									setFormData(s => {
										const newState = {
											...s,
											interviewRoundOrder: [...s.interviewRoundOrder, uniqueKey],
											interviewRoundTypes: {
												...s.interviewRoundTypes,
												[uniqueKey]: roundType
											},
											interviewRoundDetails: {
												...s.interviewRoundDetails,
												[uniqueKey]: { description: '', fromDate: '', toDate: '', startTime: '', endTime: '' }
											}
										};
										
										// Check if we've reached the specified count
										if (specifiedCount > 0 && newState.interviewRoundOrder.length === specifiedCount) {
											showSuccess(`Perfect! You have selected exactly ${specifiedCount} interview rounds as specified.`);
										}
										
										return newState;
									});
								}
							}}
						>
							<option value="">-- Select Round Type --</option>
							<option value="aptitude">Aptitude test</option>
							<option value="coding">Coding</option>
							<option value="technical">Technical</option>
							<option value="nonTechnical">Non-Technical</option>
							<option value="managerial">Managerial Round</option>
							<option value="final">Final Round</option>
							<option value="hr">HR Round</option>
							<option value="assessment">Assessment</option>
						</select>
						<div style={{marginTop: 12}}>
							<label style={{...label, marginBottom: 8, fontSize: 15, fontWeight: 600, color: '#1f2937'}}>
								<i className="fa fa-list-ol" style={{marginRight: 8, color: '#ff6b35'}}></i>
								Selected Interview Rounds (in order):
							</label>
							{formData.interviewRoundOrder.map((uniqueKey, index) => {
								const roundType = formData.interviewRoundTypes[uniqueKey];
								const roundNames = {
									technical: 'Technical',
									nonTechnical: 'Non-Technical',
									managerial: 'Managerial Round',
									final: 'Final Round',
									hr: 'HR Round',
									assessment: 'Assessment Schedule',
									aptitude: 'Aptitude test',
									coding: 'Coding'
								};
								return (
									<div key={uniqueKey} style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 8,
										padding: '10px 16px',
										background: '#fff5f2',
										borderRadius: 25,
										border: '2px solid #ff6b35',
										marginRight: 10,
										marginBottom: 10,
										color: '#ff6b35',
										boxShadow: '0 2px 8px rgba(255,107,53,0.15)'
									}}>
										<span style={{
											fontSize: 12,
											fontWeight: 700,
											color: '#fff',
											background: '#ff6b35',
											borderRadius: '50%',
											width: '22px',
											height: '22px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center'
										}}>
											{index + 1}
										</span>
										<span style={{fontSize: 14, fontWeight: 600, color: '#ff6b35'}}>Stage {index + 1}: {roundNames[roundType]}</span>
										<span 
											style={{cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: 18, marginLeft: 4}}
											onClick={() => {
												setFormData(s => {
													const newState = {
														...s,
														interviewRoundOrder: s.interviewRoundOrder.filter(key => key !== uniqueKey),
														interviewRoundTypes: Object.fromEntries(
															Object.entries(s.interviewRoundTypes).filter(([key]) => key !== uniqueKey)
														),
														interviewRoundDetails: Object.fromEntries(
															Object.entries(s.interviewRoundDetails).filter(([key]) => key !== uniqueKey)
														)
													};
													
													// Show validation message after removal
													const specifiedCount = parseInt(s.interviewRoundsCount) || 0;
													if (specifiedCount > 0 && newState.interviewRoundOrder.length < specifiedCount) {
														setTimeout(() => {
															showWarning(`You need ${specifiedCount - newState.interviewRoundOrder.length} more interview round(s) to match your specified count of ${specifiedCount}.`);
														}, 100);
													}
													
													return newState;
												});
											}}
											title="Remove this stage"
										>
											×
										</span>
									</div>
								);
							})}
							{formData.interviewRoundOrder.length === 0 && (
								<div style={{
									padding: '12px 16px',
									background: '#f3f4f6',
									borderRadius: 8,
									color: '#6b7280',
									fontSize: 14,
									textAlign: 'center',
									border: '1px dashed #d1d5db'
								}}>
									<i className="fa fa-info-circle" style={{marginRight: 8}}></i>
									No interview rounds selected yet. 
									{formData.interviewRoundsCount && (
										<span style={{color: '#ef4444', fontWeight: 600}}>
											You need to select {formData.interviewRoundsCount} round(s).
										</span>
									)}
									{!formData.interviewRoundsCount && (
										<span>Select from the dropdown above to add stages.</span>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Assessment Selection and Scheduling - Show for each Assessment instance */}
					{formData.interviewRoundOrder.some(key => formData.interviewRoundTypes[key] === 'assessment') && (
						<>
							<div style={fullRow}>
								<label style={label}>
									<i className="fa fa-clipboard-check" style={{marginRight: '8px', color: '#ff6b35'}}></i>
									Select Assessment (Global)
									<span style={{fontSize: 12, color: '#6b7280', fontWeight: 'normal', marginLeft: 8}}>
										(This will be used for all assessment rounds)
									</span>
								</label>
								<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
									<select
										style={{ ...input, flex: 1, cursor: 'pointer', borderColor: selectedAssessment ? '#10b981' : '#d1d5db', borderWidth: 2 }}
										value={selectedAssessment}
										onChange={(e) => {
											const newAssessmentId = e.target.value;
											setSelectedAssessment(newAssessmentId);
											
											// Also store in formData for better sync in updateRoundDetails
											update({ assignedAssessment: newAssessmentId });
											
											// Auto-calculate endTime for existing assessment rounds
											if (newAssessmentId) {
												const assessment = availableAssessments.find(a => (a._id === newAssessmentId || a.id === newAssessmentId));
												const duration = assessment?.timer || assessment?.timeLimit || assessment?.duration || assessment?.totalTime;
												
												if (duration) {
													setFormData(prev => {
														const newDetails = { ...prev.interviewRoundDetails };
														let changed = false;
														
														prev.interviewRoundOrder.forEach(key => {
															if (prev.interviewRoundTypes[key] === 'assessment') {
																const startTime = newDetails[key]?.startTime;
																if (startTime) {
																	const [hours, mins] = startTime.split(':').map(Number);
																	const date = new Date();
																	date.setHours(hours);
																	date.setMinutes(mins + parseInt(duration));
																	const endTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
																	newDetails[key] = { ...newDetails[key], endTime };
																	changed = true;
																}
															}
														});
														
														return changed ? { ...prev, interviewRoundDetails: newDetails } : prev;
													});
												}

												// Show assessment info when selecting an assessment
												const assessmentKey = formData.interviewRoundOrder.find(key => formData.interviewRoundTypes[key] === 'assessment');
												const details = assessmentKey ? formData.interviewRoundDetails[assessmentKey] : null;
												
												if (details?.fromDate && details?.startTime && details?.endTime) {
													showInfo(`Assessment scheduled on ${new Date(details.fromDate).toLocaleDateString()} from ${formatTimeToAMPM(details.startTime)} to ${formatTimeToAMPM(details.endTime)}`, 4000);
												} else {
													showInfo('Please set assessment dates and times below to complete the schedule.', 3000);
												}
											}
										}}
									>
										<option value="">-- Select Assessment --</option>
										{availableAssessments.map((assessment) => (
											<option key={assessment._id} value={assessment._id}>
												{assessment.title} ({assessment.timer || assessment.timeLimit || assessment.duration || assessment.totalTime || 'No duration set'}{assessment.timer || assessment.timeLimit || assessment.duration || assessment.totalTime ? ' min' : ''})
											</option>
										))}}
									</select>
									{selectedAssessment && (
										<div style={{display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 14, fontWeight: 600}}>
											<i className="fa fa-check-circle"></i>
											<span>Selected</span>
										</div>
									)}
								</div>
								{selectedAssessment && (
									<div style={{
										marginTop: 8,
										padding: '12px 16px',
										background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
										borderRadius: 8,
										color: '#92400e',
										fontSize: 13,
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										border: '2px solid #f59e0b',
										boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)'
									}}>
										<i className="fa fa-clock" style={{fontSize: 16, color: '#d97706'}}></i>
										<div>
											<div style={{fontWeight: 700, marginBottom: 2}}>⏰ Assessment Schedule</div>
											<div style={{fontSize: 12, opacity: 0.9}}>
												{(() => {
													const assessmentKey = formData.interviewRoundOrder.find(key => formData.interviewRoundTypes[key] === 'assessment');
													const details = assessmentKey ? formData.interviewRoundDetails[assessmentKey] : null;
													if (details?.fromDate && details?.startTime && details?.endTime) {
														return `Available on ${new Date(details.fromDate).toLocaleDateString()} from ${formatTimeToAMPM(details.startTime)} to ${formatTimeToAMPM(details.endTime)}`;
													}
													return 'Set assessment dates and times below to see the schedule';
												})()
											}
											</div>
										</div>
									</div>
								)}
								{selectedAssessment && (
									<div style={{
										marginTop: 8,
										padding: '12px 16px',
										background: 'linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)',
										borderRadius: 8,
										color: '#1e40af',
										fontSize: 13,
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										border: '2px solid #3b82f6',
										boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
									}}>
										<i className="fa fa-exclamation-triangle" style={{fontSize: 16, color: '#1d4ed8'}}></i>
										<div>
											<div style={{fontWeight: 700, marginBottom: 2}}>⚠️ Assessment Time Restriction</div>
											<div style={{fontSize: 12, opacity: 0.9}}>Candidates can only access the assessment during the specified date/time window you set below</div>
										</div>
									</div>
								)}
							</div>

							{/* Individual Assessment Scheduling for each Assessment instance */}
							{formData.interviewRoundOrder
								.filter(key => formData.interviewRoundTypes[key] === 'assessment')
								.map((assessmentKey, assessmentIndex) => {
									const stageNumber = formData.interviewRoundOrder.indexOf(assessmentKey) + 1;
									return (
										<div key={assessmentKey} style={fullRow}>
											<h4 style={{ 
												margin: "16px 0 12px 0", 
												fontSize: 16, 
												color: "#ff6b35",
												fontWeight: 600,
												display: 'flex',
												alignItems: 'center',
												gap: 8
											}}>
												<span style={{
													fontSize: 12,
													fontWeight: 700,
													color: '#fff',
													background: '#ff6b35',
													borderRadius: '50%',
													width: '24px',
													height: '24px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center'
												}}>
													{stageNumber}
												</span>
												Stage {stageNumber}: Assessment Schedule {assessmentIndex + 1}
												<div style={{display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12}}>
													<button
														style={{
															background: '#10b981',
															color: '#fff',
															border: 'none',
															padding: '6px 12px',
															borderRadius: 6,
															cursor: 'pointer',
															fontSize: 12,
															fontWeight: 600,
															display: 'flex',
															alignItems: 'center',
															gap: 4
														}}
														title="Schedule Assessment"
														onClick={() => {
															const assessmentDetails = formData.interviewRoundDetails[assessmentKey];
															
															if (!selectedAssessment) {
																showWarning('Please select an assessment first');
																return;
															}
															
															if (!assessmentDetails?.fromDate) {
																showWarning(`Please set the Date for Assessment ${assessmentIndex + 1}`);
																return;
															}
															
															// Mark this assessment as scheduled
															setScheduledRounds(prev => ({...prev, [assessmentKey]: true}));
															
															// Format dates as DD/MM/YYYY
															const formatDate = (date) => {
																const d = new Date(date);
																const day = d.getDate().toString().padStart(2, '0');
																const month = (d.getMonth() + 1).toString().padStart(2, '0');
																const year = d.getFullYear();
																return `${day}/${month}/${year}`;
															};
															
															showSuccess(`Assessment ${assessmentIndex + 1} scheduled successfully! Assessment: ${availableAssessments.find(a => a._id === selectedAssessment)?.title} | Date: ${formatDate(assessmentDetails.fromDate)}`);
														}}
													>
														<i className="fa fa-calendar-plus"></i>
														Schedule
													</button>
													<i 
														className="fa fa-edit"
														style={{cursor: 'pointer', color: '#3b82f6', fontSize: 16}}
														title="Edit assessment schedule"
														onClick={() => {
															const assessmentSection = document.querySelector(`[data-assessment-key="${assessmentKey}"]`);
															if (assessmentSection) {
																assessmentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
																assessmentSection.style.border = '3px solid #3b82f6';
																setTimeout(() => {
																	assessmentSection.style.border = '1px solid #0ea5e9';
																}, 2000);
															}
														}}
													/>
												</div>
											</h4>
											<div 
												data-assessment-key={assessmentKey}
												style={{ 
													display: 'grid', 
													gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
													gap: isMobile ? 8 : 12,
													padding: 12,
													border: '1px solid #0ea5e9',
													borderRadius: 8,
													background: '#f0f9ff',
													transition: 'border 0.3s ease'
												}}>
												<div>
													<div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
														<label style={{...label, marginBottom: 0}}>
															<i className="fa fa-calendar" style={{marginRight: 4, color: '#ff6b35'}}></i>
															Select Date
														</label>
														{formData.interviewRoundDetails[assessmentKey]?.fromDate && (
															<div style={{fontSize: 10, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', padding: '2px 6px', borderRadius: 4, border: '1px solid #6b7280'}}>
																<i className="fa fa-check-circle"></i>
																Saved
															</div>
														)}
													</div>
													<input
														style={{...input, fontSize: 13}}
														type="date"
														min={new Date().toISOString().split('T')[0]}
														value={formData.interviewRoundDetails[assessmentKey]?.fromDate || ''}
														onChange={(e) => updateRoundDetails(assessmentKey, 'fromDate', e.target.value)}
													/>
													<HolidayIndicator date={formData.interviewRoundDetails[assessmentKey]?.fromDate} />
												</div>
												<div>
													<label style={{...label, marginBottom: 4}}>
														<i className="fa fa-clock" style={{marginRight: 4, color: '#ff6b35'}}></i>
														Start Time
													</label>
													<input
														style={{...input, fontSize: 13}}
														type="time"
														value={formData.interviewRoundDetails[assessmentKey]?.startTime || ''}
														onChange={(e) => updateRoundDetails(assessmentKey, 'startTime', e.target.value)}
													/>
												</div>
												<div>
													<label style={{...label, marginBottom: 4}}>
														<i className="fa fa-clock" style={{marginRight: 4, color: '#ff6b35'}}></i>
														End Time
													</label>
													<input
														style={{...input, fontSize: 13}}
														type="time"
														value={formData.interviewRoundDetails[assessmentKey]?.endTime || ''}
														onChange={(e) => updateRoundDetails(assessmentKey, 'endTime', e.target.value)}
													/>
												</div>
											</div>
										</div>
									);
								})}
						</>
					)}

					<div style={fullRow}>
						<div
							style={{
								display: "none",
								gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
								gap: isMobile ? 8 : 12,
								padding: 16,
								borderRadius: 8,
							}}
						>
							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.technical ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.technical ? (formData.interviewRoundOrder || []).indexOf('technical') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.technical}
									onChange={() =>
										toggleNested("interviewRoundTypes", "technical")
									}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Technical</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.nonTechnical ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.nonTechnical ? (formData.interviewRoundOrder || []).indexOf('nonTechnical') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.nonTechnical}
									onChange={() =>
										toggleNested("interviewRoundTypes", "nonTechnical")
									}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Non-Technical</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.managerial ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.managerial ? (formData.interviewRoundOrder || []).indexOf('managerial') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.managerial}
									onChange={() =>
										toggleNested("interviewRoundTypes", "managerial")
									}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Managerial Round</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.final ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.final ? (formData.interviewRoundOrder || []).indexOf('final') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.final}
									onChange={() => toggleNested("interviewRoundTypes", "final")}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Final Round</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.hr ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.hr ? (formData.interviewRoundOrder || []).indexOf('hr') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.hr}
									onChange={() => toggleNested("interviewRoundTypes", "hr")}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>HR Round</span>
							</label>

							<label style={{ 
								display: "flex", 
								alignItems: "center", 
								gap: 10,
								cursor: 'pointer',
								padding: 8,
								borderRadius: 6,
								transition: 'background 0.2s',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
							onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
							>
								<span style={{
									fontSize: 12, 
									color: '#fff', 
									minWidth: '20px',
									height: '20px',
									background: formData.interviewRoundTypes.assessment ? '#10b981' : '#d1d5db',
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 600,
								}}>
									{formData.interviewRoundTypes.assessment ? (formData.interviewRoundOrder || []).indexOf('assessment') + 1 : ''}
								</span>
								<input
									type="checkbox"
									checked={formData.interviewRoundTypes.assessment}
									onChange={() => toggleNested("interviewRoundTypes", "assessment")}
									style={{cursor: 'pointer'}}
								/>
								<span style={{fontSize: 14, fontWeight: 500}}>Assessment</span>
							</label>
						</div>
					</div>

					{/* Interview Round Details - Only show for non-assessment rounds */}
					{formData.interviewRoundOrder.filter(uniqueKey => formData.interviewRoundTypes[uniqueKey] !== 'assessment').length > 0 && (
						<>
						<div style={fullRow}>
							<h4 style={{ margin: "16px 0 12px 0", fontSize: 15, color: "#0f172a" }}>
								Interview Round Details
							</h4>
							{formData.interviewRoundOrder
								.filter(uniqueKey => formData.interviewRoundTypes[uniqueKey] !== 'assessment')
								.map((uniqueKey, index) => {
									const roundType = formData.interviewRoundTypes[uniqueKey];
									const roundNames = {
										technical: 'Technical Round',
										nonTechnical: 'Non-Technical Round',
										managerial: 'Managerial Round',
										final: 'Final Round',
										hr: 'HR Round',
										assessment: 'Assessment',
										aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
										coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
									};
									const stageNumber = formData.interviewRoundOrder.indexOf(uniqueKey) + 1;
									return (
										<div key={uniqueKey} data-stage-key={uniqueKey} style={{ 
											marginBottom: 16, 
											padding: 16, 
											border: '1px solid #e5e7eb', 
											borderRadius: 12,
											background: '#fff',
											boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
											transition: 'border 0.3s ease'
										}}>
											<h5 style={{ 
												margin: '0 0 12px 0', 
												fontSize: 16, 
												color: '#1f2937',
												fontWeight: 600,
												display: 'flex',
												alignItems: 'center',
												gap: 8,
												justifyContent: 'space-between'
											}}>
												<span style={{
													fontSize: 12,
													fontWeight: 700,
													color: '#fff',
													background: '#ff6b35',
													borderRadius: '50%',
													width: '24px',
													height: '24px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center'
												}}>
													{stageNumber}
												</span>
												<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
													Stage {stageNumber}: {roundNames[roundType]}
												</div>
												<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
													<button
														style={{
															background: '#10b981',
															color: '#fff',
															border: 'none',
															padding: '6px 12px',
															borderRadius: 6,
															cursor: 'pointer',
															fontSize: 12,
															fontWeight: 600,
															display: 'flex',
															alignItems: 'center',
															gap: 4
														}}
														title={`Schedule ${roundNames[roundType]}`}
														onClick={() => {
															const roundDetails = formData.interviewRoundDetails[uniqueKey];
															
															if (!roundDetails?.description?.trim()) {
																showWarning(`Please enter description for ${roundNames[roundType]}`);
																return;
															}
															
															if (!roundDetails?.fromDate) {
																showWarning(`Please set the Date for ${roundNames[roundType]}`);
																return;
															}
															
															if (!roundDetails?.startTime || !roundDetails?.endTime) {
																showWarning(`Please set both From and To Time for ${roundNames[roundType]}`);
																return;
															}
															
															// Mark this round as scheduled
															setScheduledRounds(prev => ({...prev, [uniqueKey]: true}));
															
															// Format dates as DD/MM/YYYY
															const formatDate = (date) => {
																const d = new Date(date);
																const day = d.getDate().toString().padStart(2, '0');
																const month = (d.getMonth() + 1).toString().padStart(2, '0');
																const year = d.getFullYear();
																return `${day}/${month}/${year}`;
															};
															
															showSuccess(`${roundNames[roundType]} scheduled successfully! Date: ${formatDate(roundDetails.fromDate)} | Time: ${formatTimeToAMPM(roundDetails.startTime)} - ${formatTimeToAMPM(roundDetails.endTime)}`);
														}}
													>
														<i className="fa fa-calendar-plus"></i>
														Schedule
													</button>
													<i 
														className="fa fa-edit"
														style={{cursor: 'pointer', color: '#3b82f6', fontSize: 16}}
														title={`Edit ${roundNames[roundType]} details`}
														onClick={() => {
															const stageSection = document.querySelector(`[data-stage-key="${uniqueKey}"]`);
															if (stageSection) {
																stageSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
																stageSection.style.border = '3px solid #3b82f6';
																setTimeout(() => {
																	stageSection.style.border = '1px solid #e5e7eb';
																}, 2000);
															}
														}}
													/>
												</div>
											</h5>
											<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr 1fr', gap: isMobile ? 8 : 12, alignItems: 'start' }}>
												<div>
													<label style={{...label, marginBottom: 4}}>Description</label>
													<textarea
														style={{...input, minHeight: '60px', fontSize: 13}}
														placeholder={`Describe the ${roundNames[roundType] ? roundNames[roundType].toLowerCase() : 'round'}...`}
																						value={formData.interviewRoundDetails[uniqueKey]?.description || ''}
														onChange={(e) => updateRoundDetails(uniqueKey, 'description', e.target.value)}
													/>
												</div>
												<div>
													<div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
														<label style={{...label, marginBottom: 0}}>
															<i className="fa fa-calendar" style={{marginRight: 4, color: '#ff6b35'}}></i>
															Select Date
														</label>
														{formData.interviewRoundDetails[uniqueKey]?.fromDate && (
															<div style={{fontSize: 10, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', padding: '2px 6px', borderRadius: 4, border: '1px solid #6b7280'}}>
																<i className="fa fa-check-circle"></i>
																Saved
															</div>
														)}
													</div>
													<input
														style={{
															...input, 
															fontSize: 13,
															borderColor: formData.interviewRoundDetails[uniqueKey]?.fromDate ? '#10b981' : '#d1d5db',
															background: formData.interviewRoundDetails[uniqueKey]?.fromDate ? '#f0fdf4' : '#fff'
														}}
														type="date"
														min={new Date().toISOString().split('T')[0]}
														value={formData.interviewRoundDetails[uniqueKey]?.fromDate || ''}
														onChange={(e) => updateRoundDetails(uniqueKey, 'fromDate', e.target.value)}
													/>
													<HolidayIndicator date={formData.interviewRoundDetails[uniqueKey]?.fromDate} />
												</div>
												<div>
													<label style={{...label, marginBottom: 4}}>From Time</label>
													<input
														style={{...input, fontSize: 13}}
														type="time"
														value={formData.interviewRoundDetails[uniqueKey]?.startTime || ''}
														onChange={(e) => updateRoundDetails(uniqueKey, 'startTime', e.target.value)}
													/>
												</div>
												<div>
													<label style={{...label, marginBottom: 4}}>To Time</label>
													<input
														style={{...input, fontSize: 13}}
														type="time"
														value={formData.interviewRoundDetails[uniqueKey]?.endTime || ''}
														onChange={(e) => updateRoundDetails(uniqueKey, 'endTime', e.target.value)}
													/>
												</div>
											</div>
										</div>
									);
								})
							}
						</div>
						</>
					)}

					{/* Interview Schedule Summary */}
					{formData.interviewRoundOrder.length > 0 && (
						<div style={fullRow}>
							<div style={{
								padding: 16,
								background: '#f8fafc',
								border: '2px solid #e2e8f0',
								borderRadius: 12,
								marginBottom: 16
							}}>
								<h4 style={{
									margin: '0 0 12px 0',
									fontSize: 16,
									color: '#1e293b',
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									gap: 8
								}}>
									<i className="fa fa-calendar-check" style={{color: '#3b82f6'}}></i>
									Interview Schedule Summary
								</h4>
								<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12}}>
									{formData.interviewRoundOrder.map((uniqueKey, index) => {
										const roundType = formData.interviewRoundTypes[uniqueKey];
										const details = formData.interviewRoundDetails[uniqueKey];
										const roundNames = {
											technical: 'Technical',
											nonTechnical: 'Non-Technical',
											managerial: 'Managerial',
											final: 'Final',
											hr: 'HR',
											assessment: 'Assessment',
											aptitude: 'Aptitude test - SOFTWARE ENGINEERING',
											coding: 'Coding - SENIOR SOFTWARE ENGINEERING'
										};
										
										return (
											<div key={uniqueKey} style={{
												padding: 12,
												background: '#fff',
												border: '1px solid #e2e8f0',
												borderRadius: 8,
												boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
											}}>
												<div style={{
													display: 'flex',
													alignItems: 'center',
													gap: 8,
													marginBottom: 8
												}}>
													<span style={{
														fontSize: 12,
														fontWeight: 700,
														color: '#fff',
														background: '#3b82f6',
														borderRadius: '50%',
														width: '20px',
														height: '20px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center'
													}}>
														{index + 1}
													</span>
													<span style={{fontSize: 14, fontWeight: 600, color: '#1e293b'}}>
														{roundNames[roundType]} Round
													</span>
												</div>
												{details?.fromDate ? (
													<div style={{fontSize: 13, color: '#6b7280', fontWeight: 500}}>
														<i className="fa fa-calendar" style={{marginRight: 6}}></i>
														{new Date(details.fromDate).toLocaleDateString()}
														{(details.startTime || details.endTime) && (
															<span style={{marginLeft: 8}}>
																<i className="fa fa-clock" style={{marginRight: 4}}></i>
																{details.startTime ? formatTimeToAMPM(details.startTime) : 'N/A'} - {details.endTime ? formatTimeToAMPM(details.endTime) : 'N/A'}
															</span>
														)}
													</div>
												) : (
													<div style={{fontSize: 13, color: '#ef4444', fontStyle: 'italic'}}>
														<i className="fa fa-exclamation-triangle" style={{marginRight: 6}}></i>
														Date not set
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{/* Additional Details Section */}
					<div style={fullRow}>
						<h3 style={sectionHeader}>
							<i className="fa fa-file-alt" style={{color: '#ff6b35'}}></i>
							Additional Details
						</h3>
					</div>

					{/* Dates */}
					<div>
						<label style={label}>
							<i className="fa fa-calendar-alt" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Offer Letter Release Date <span style={redAsterisk}>*</span>
						</label>
						<input
							style={input}
							type="date"
							min={new Date().toISOString().split('T')[0]}
							value={formData.offerLetterDate || ''}
							onChange={(e) => update({ offerLetterDate: e.target.value })}
							placeholder="DD/MM/YYYY"
						/>
						{errors.offerLetterDate && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.offerLetterDate[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Format: DD/MM/YYYY
						</small>
						<HolidayIndicator date={formData.offerLetterDate} />
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-walking" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Joining Date
						</label>
						<input
							style={input}
							type="date"
							min={formData.offerLetterDate || new Date().toISOString().split('T')[0]}
							value={formData.joiningDate || ''}
							onChange={(e) => update({ joiningDate: e.target.value })}
							placeholder="DD/MM/YYYY"
						/>
						{errors.joiningDate && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.joiningDate[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Format: DD/MM/YYYY
						</small>
						<HolidayIndicator date={formData.joiningDate} />
					</div>

					<div>
						<label style={label}>
							<i className="fa fa-calendar-times" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Last Date of Application <span style={redAsterisk}>*</span>
						</label>
						<div style={{display: 'flex', gap: 12, alignItems: 'flex-end'}}>
							<div style={{flex: 1}}>
								<input
									style={{
										...input,
										borderColor: formData.lastDateOfApplication ? '#10b981' : '#d1d5db',
										background: formData.lastDateOfApplication ? '#f0fdf4' : '#fff'
									}}
									type="date"
									min={new Date().toISOString().split('T')[0]}
									max={(() => {
										const allRoundDates = [];
										formData.interviewRoundOrder.forEach(key => {
											const details = formData.interviewRoundDetails[key];
											if (details?.fromDate) {
												const d = new Date(details.fromDate);
												if (!isNaN(d.getTime())) {
													allRoundDates.push(d);
												}
											}
										});
										if (allRoundDates.length > 0) {
											const earliest = new Date(Math.min(...allRoundDates));
											if (!isNaN(earliest.getTime())) {
												// Subtract 1 day
												earliest.setDate(earliest.getDate() - 1);
												const maxDate = earliest.toISOString().split('T')[0];
												const today = new Date().toISOString().split('T')[0];
												// If maxDate would be before today, don't set a max so user can at least select today
												// and let the manual validation show the error message
												return maxDate < today ? undefined : maxDate;
											}
										}
										return undefined;
									})()}
									value={formData.lastDateOfApplication || ''}
									onChange={(e) => update({ lastDateOfApplication: e.target.value })}
									placeholder="DD/MM/YYYY"
								/>
							</div>
							<div style={{flex: 1}}>
								<input
									style={{
										...input,
										borderColor: formData.lastDateOfApplicationTime ? '#10b981' : '#d1d5db',
										background: formData.lastDateOfApplicationTime ? '#f0fdf4' : '#fff'
									}}
									type="time"
									value={formData.lastDateOfApplicationTime || ''}
									onChange={(e) => update({ lastDateOfApplicationTime: e.target.value })}
									placeholder="HH:MM AM/PM"
								/>
							</div>
						</div>
						<small style={{color: '#6b7280', fontSize: 11, marginTop: 4, display: 'block'}}>
							Time (AM/PM or 24-hour format) and Date - Optional: Set deadline time (e.g., 11:59 PM or 23:59)
						</small>
						{errors.lastDateOfApplication && (
							<div style={{color: '#dc2626', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4}}>
								<i className="fa fa-exclamation-circle"></i>
								{errors.lastDateOfApplication[0]}
							</div>
						)}
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 4, display: 'block'}}>
							Set the deadline for job applications
						</small>
						<HolidayIndicator date={formData.lastDateOfApplication} />
					</div>

					{/* Job Description */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-align-left" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Job Description <span style={redAsterisk}>*</span>
						</label>
						<RichTextEditor
							value={formData.jobDescription || 'We are looking for a talented professional to join our dynamic team. The ideal candidate will be responsible for key tasks and contribute to our company\'s growth and success.'}
							onChange={(value) => update({ jobDescription: value })}
							placeholder="Provide a detailed description of the job role, responsibilities, and expectations..."
							className="form-control-editor"
						/>
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 8, display: 'block'}}>
							Use the toolbar above to format your job description with bold, italic, lists, and alignment options
						</small>
					</div>

					{/* Roles and Responsibilities */}
					<div style={fullRow}>
						<label style={label}>
							<i className="fa fa-tasks" style={{marginRight: '8px', color: '#ff6b35'}}></i>
							Roles and Responsibilities <span style={redAsterisk}>*</span>
						</label>
						<RichTextEditor
							value={formData.rolesAndResponsibilities || ''}
							onChange={(value) => update({ rolesAndResponsibilities: value })}
							placeholder="List the key roles and responsibilities for this position..."
							className="form-control-editor"
						/>
						<small style={{color: '#6b7280', fontSize: 12, marginTop: 8, display: 'block'}}>
							Use bullet points or numbered lists to clearly outline the main responsibilities
						</small>
					</div>
				</div>
			</div>

			{/* Interview Date Tester - Show for testing */}
			{isEditMode && (
				<InterviewDateTester jobId={id} />
			)}

			{/* Action Buttons */}
			<div style={{ 
				display: "flex", 
				flexDirection: isMobile ? "column" : "row",
				justifyContent: "flex-end", 
				marginTop: isMobile ? 24 : 32,
				paddingTop: isMobile ? 16 : 24,
				borderTop: '2px solid #f3f4f6',
				gap: 16,
			}}>
				<button
					onClick={handleSubmitClick}
					style={{
						background: "transparent",
						color: "#ff6b35",
						border: "2px solid #ff6b35",
						padding: "12px 32px",
						borderRadius: 8,
						cursor: "pointer",
						fontSize: 15,
						fontWeight: 600,
						transition: "all 0.2s ease",
						boxShadow: "0 4px 12px rgba(255,107,53,0.1)",
						display: 'flex',
						alignItems: 'center',
						gap: 8,
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#ff6b35';
						e.currentTarget.style.color = '#fff';
						e.currentTarget.style.transform = 'translateY(-2px)';
						e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,53,0.4)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = 'transparent';
						e.currentTarget.style.color = '#ff6b35';
						e.currentTarget.style.transform = 'translateY(0)';
						e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.1)';
					}}
				>
					{isEditMode ? (
						<>
							<i className="fa fa-save"></i>
							Update Job
						</>
					) : (
						<>
							<i className="fa fa-paper-plane"></i>
							Submit Job
						</>
					)}
				</button>
			</div>
			
			{/* Confirmation Modal */}
			{showConfirmModal && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 9999
				}}>
					<div style={{
						background: '#fff',
						borderRadius: 12,
						padding: '32px',
						maxWidth: '500px',
						width: '90%',
						boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
					}}>
						<div style={{textAlign: 'center', marginBottom: 24}}>
							<div style={{
								width: 60,
								height: 60,
								background: '#fff3cd',
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								margin: '0 auto 16px'
							}}>
								<i className="fa fa-exclamation-triangle" style={{fontSize: 28, color: '#ff6b35'}}></i>
							</div>
							<h3 style={{margin: 0, fontSize: 22, color: '#1f2937', fontWeight: 700}}>Confirm Submission</h3>
						</div>
						<p style={{fontSize: 15, color: '#4b5563', lineHeight: 1.6, marginBottom: 24, textAlign: 'center'}}>
							{isEditMode 
								? "Are you sure you want to update this job? Once updated, the changes will be reflected immediately."
								: "Are you sure you want to submit this job? Once you submit, you won't be able to edit it. Please review all details carefully before proceeding."}
						</p>
						<div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
							<button
								onClick={() => setShowConfirmModal(false)}
								style={{
									background: '#e5e7eb',
									color: '#374151',
									border: 'none',
									padding: '12px 24px',
									borderRadius: 8,
									cursor: 'pointer',
									fontSize: 15,
									fontWeight: 600,
									transition: 'all 0.2s'
								}}
								onMouseEnter={(e) => e.currentTarget.style.background = '#d1d5db'}
								onMouseLeave={(e) => e.currentTarget.style.background = '#e5e7eb'}
							>
								Cancel
							</button>
							<button
								onClick={submitNext}
								style={{
									background: '#ff6b35',
									color: '#fff',
									border: 'none',
									padding: '12px 24px',
									borderRadius: 8,
									cursor: 'pointer',
									fontSize: 15,
									fontWeight: 600,
									transition: 'all 0.2s'
								}}
								onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
								onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b35'}
							>
								{isEditMode ? 'Yes, Update' : 'Yes, Submit'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

