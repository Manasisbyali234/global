# Tale Job Portal Backend API

Complete Node.js + Express + MongoDB backend for https://tale.websitescheckup.in

## 🏗️ Architecture

### Modular Structure
```
tale-backend/
├── config/          # Database configuration
├── controllers/     # Business logic controllers
├── middlewares/     # Authentication, validation, error handling
├── models/          # MongoDB schemas with Mongoose
├── routes/          # API route definitions
├── uploads/         # File storage (resumes, logos, images)
├── utils/           # Utility functions
└── server.js        # Main application entry point
```

## 🔗 API Routes Mapping

### Public Routes (`/api/public`)
- `GET /jobs` → `publicController.getJobs` → `Job` schema
- `GET /jobs/search` → `publicController.searchJobs` → `Job` schema
- `GET /blogs` → `publicController.getBlogs` → `Blog` schema
- `GET /blogs/:id` → `publicController.getBlogById` → `Blog` schema
- `POST /contact` → `publicController.submitContactForm` → `Contact` schema
- `GET /testimonials` → `publicController.getTestimonials` → `Testimonial` schema
- `GET /partners` → `publicController.getPartners` → `Partner` schema
- `GET /faqs` → `publicController.getFAQs` → `FAQ` schema

### Candidate Routes (`/api/candidate`)
- `POST /register` → `candidateController.registerCandidate` → `Candidate` schema
- `POST /login` → `candidateController.loginCandidate` → `Candidate` schema
- `PUT /profile` → `candidateController.updateProfile` → `CandidateProfile` schema
- `POST /profile/resume` → `candidateController.uploadResume` → `CandidateProfile` schema
- `POST /jobs/:jobId/apply` → `candidateController.applyForJob` → `Application` schema
- `GET /applications` → `candidateController.getAppliedJobs` → `Application` schema
- `GET /applications/:id/status` → `candidateController.getApplicationStatus` → `Application` schema
- `POST /messages` → `candidateController.sendMessage` → `Message` schema
- `GET /messages/:conversationId` → `candidateController.getMessages` → `Message` schema
- `POST /password/reset` → `candidateController.resetPassword` → `Candidate` schema
- `PUT /password/change` → `candidateController.changePassword` → `Candidate` schema

### Employer Routes (`/api/employer`)
- `POST /register` → `employerController.registerEmployer` → `Employer` schema
- `POST /login` → `employerController.loginEmployer` → `Employer` schema
- `PUT /profile` → `employerController.updateProfile` → `EmployerProfile` schema
- `POST /profile/logo` → `employerController.uploadLogo` → `EmployerProfile` schema
- `POST /jobs` → `employerController.createJob` → `Job` schema
- `PUT /jobs/:jobId` → `employerController.updateJob` → `Job` schema
- `DELETE /jobs/:jobId` → `employerController.deleteJob` → `Job` schema
- `GET /jobs` → `employerController.getEmployerJobs` → `Job` schema
- `GET /applications/:id` → `employerController.reviewApplication` → `Application` schema
- `PUT /applications/:id/status` → `employerController.updateApplicationStatus` → `Application` schema
- `POST /messages` → `employerController.sendMessage` → `Message` schema
- `GET /messages/:conversationId` → `employerController.getMessages` → `Message` schema
- `POST /subscription` → `employerController.createSubscription` → `Subscription` schema
- `GET /subscription` → `employerController.getSubscription` → `Subscription` schema
- `PUT /subscription` → `employerController.updateSubscription` → `Subscription` schema

### Admin Routes (`/api/admin`)
- `POST /login` → `adminController.loginAdmin` → `Admin` schema
- `GET /dashboard/stats` → `adminController.getDashboardStats` → Aggregated data
- `GET /users` → `adminController.getUsers` → `Candidate`, `Employer` schemas
- `DELETE /users/:type/:id` → `adminController.deleteUser` → `Candidate`, `Employer` schemas
- `PUT /users/:type/:id` → `adminController.updateUser` → `Candidate`, `Employer` schemas
- `GET /jobs` → `adminController.getAllJobs` → `Job` schema
- `PUT /jobs/:id/approve` → `adminController.approveJob` → `Job` schema
- `PUT /jobs/:id/reject` → `adminController.rejectJob` → `Job` schema
- `POST /content/:type` → `adminController.createContent` → `Blog`, `Testimonial`, `FAQ`, `Partner` schemas
- `PUT /content/:type/:id` → `adminController.updateContent` → Content schemas
- `DELETE /content/:type/:id` → `adminController.deleteContent` → Content schemas
- `GET /contacts` → `adminController.getContactForms` → `Contact` schema
- `DELETE /contacts/:id` → `adminController.deleteContactForm` → `Contact` schema
- `GET /settings` → `adminController.getSettings` → `SiteSettings` schema
- `PUT /settings` → `adminController.updateSettings` → `SiteSettings` schema

## 🗄️ Database Schemas

1. **Candidate** - User authentication for candidates
2. **CandidateProfile** - Extended candidate information (linked to Candidate)
3. **Employer** - User authentication for employers
4. **EmployerProfile** - Company details (linked to Employer)
5. **Admin** - Admin user authentication
6. **Job** - Job postings with search indexing
7. **Application** - Job applications with status tracking
8. **Message** - Candidate-Employer messaging system
9. **Blog** - Content management for blogs
10. **Contact** - Contact form submissions
11. **Testimonial** - Client testimonials
12. **Partner** - Business partners
13. **FAQ** - Frequently asked questions
14. **Subscription** - Employer subscription management
15. **SiteSettings** - Global site configuration

## 🔐 Authentication & Security

- **JWT Authentication** for all user roles (Candidate, Employer, Admin)
- **bcrypt** password hashing
- **Role-based access control** middleware
- **Input validation** with express-validator
- **Error handling** middleware
- **Security headers** with Helmet
- **Rate limiting** protection
- **File upload** validation and storage

## 🚀 Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables in `.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tale_jobportal
JWT_SECRET=tale_jwt_secret_key_2024
JWT_EXPIRE=30d
NODE_ENV=development
```

3. **Start the server:**
```bash
npm run dev
```

4. **API Base URL:**
```
http://localhost:5000/api
```

## 📁 File Upload Structure
- **Resumes:** `/uploads/resumes/`
- **Company Logos:** `/uploads/logos/`
- **Images:** `/uploads/images/`

The backend is fully modular, scalable, and ready for production deployment with proper error handling, validation, and security measures.