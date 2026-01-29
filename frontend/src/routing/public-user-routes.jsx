
import { Route, Routes } from "react-router-dom";
import { publicUser } from "../globals/route-names";
import { lazy, Suspense } from "react";

// Lazy load components for better performance
const Home16Page = lazy(() => import("../app/pannels/public-user/components/home/index16"));
const JobsGridPage = lazy(() => import("../app/pannels/public-user/components/jobs/jobs-grid"));
const JobsGridMapPage = lazy(() => import("../app/pannels/public-user/components/jobs/jobs-grid-map"));
const JobsListPage = lazy(() => import("../app/pannels/public-user/components/jobs/jobs-list"));
const JobDetail1Page = lazy(() => import("../app/pannels/public-user/components/jobs/job-detail1"));
const JobDetail2Page = lazy(() => import("../app/pannels/public-user/components/jobs/job-detail2"));
const ApplyJobPage = lazy(() => import("../app/pannels/public-user/components/jobs/apply-job"));
const EmployersGridPage = lazy(() => import("../app/pannels/public-user/components/employers/emp-grid"));
const EmployersListPage = lazy(() => import("../app/pannels/public-user/components/employers/emp-list"));
const EmployersDetail1Page = lazy(() => import("../app/pannels/public-user/components/employers/emp-detail1"));
const EmployersDetail2Page = lazy(() => import("../app/pannels/public-user/components/employers/emp-detail2"));
const AboutUsPage = lazy(() => import("../app/pannels/public-user/components/pages/about-us"));
const PricingPage = lazy(() => import("../app/pannels/public-user/components/pages/pricing"));
const Error404Page = lazy(() => import("../app/pannels/public-user/components/pages/error404"));
const FaqPage = lazy(() => import("../app/pannels/public-user/components/pages/faq"));
const ContactUsPage = lazy(() => import("../app/pannels/public-user/components/pages/contact-us"));
const UnderMaintenancePage = lazy(() => import("../app/pannels/public-user/components/pages/under-maintenance"));
const ComingSoonPage = lazy(() => import("../app/pannels/public-user/components/pages/coming-soon"));
const LoginPage = lazy(() => import("../app/pannels/public-user/components/pages/login"));
const LoginCandidatePage = lazy(() => import("../app/pannels/public-user/components/pages/auth/LoginCandidate"));
const LoginEmployerPage = lazy(() => import("../app/pannels/public-user/components/pages/auth/LoginEmployer"));
const LoginPlacementPage = lazy(() => import("../app/pannels/public-user/components/pages/auth/LoginPlacement"));
const SignupCandidatePage = lazy(() => import("../app/pannels/public-user/components/pages/auth/SignupCandidate"));
const SignupEmployerPage = lazy(() => import("../app/pannels/public-user/components/pages/auth/SignupEmployer"));
const SignupPlacementPage = lazy(() => import("../app/pannels/public-user/components/pages/auth/SignupPlacement"));
const IconsPage = lazy(() => import("../app/pannels/public-user/components/pages/icons"));
const CandidateGridPage = lazy(() => import("../app/pannels/public-user/components/candidates/can-grid"));
const CandidateListPage = lazy(() => import("../app/pannels/public-user/components/candidates/can-list"));
const CandidateDetail1Page = lazy(() => import("../app/pannels/public-user/components/candidates/can-detail1"));
const CandidateDetail2Page = lazy(() => import("../app/pannels/public-user/components/candidates/can-detail2"));
const BlogGrid1Page = lazy(() => import("../app/pannels/public-user/components/blogs/blogs-grid1"));
const BlogGrid2Page = lazy(() => import("../app/pannels/public-user/components/blogs/blogs-grid2"));
const BlogGrid3Page = lazy(() => import("../app/pannels/public-user/components/blogs/blogs-grid3"));
const BlogListPage = lazy(() => import("../app/pannels/public-user/components/blogs/blogs-list"));
const BlogDetailPage = lazy(() => import("../app/pannels/public-user/components/blogs/blog-detail"));
const ForgotPassword = lazy(() => import("../app/pannels/public-user/components/pages/forgot-password"));
const ResetPassword = lazy(() => import("../app/pannels/public-user/components/pages/reset-password"));
const TermsConditionsPage = lazy(() => import("../app/pannels/public-user/components/pages/terms-conditions"));
const PrivacyPolicyPage = lazy(() => import("../app/pannels/public-user/components/pages/privacy-policy"));
const SupportPage = lazy(() => import("../app/pannels/public-user/components/pages/support"));
const TutorialsPage = lazy(() => import("../app/pages/tutorials"));
const AdminLogin = lazy(() => import("../app/admin-login/page"));
const SubAdminLogin = lazy(() => import("../app/sub-admin-login/page"));
const CreatePassword = lazy(() => import("../app/common/CreatePassword"));

function PublicUserRoutes() {
    return (
        <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}><div>Loading...</div></div>}>
            <Routes>
            <Route path={publicUser.INITIAL} element={<Home16Page />} />

            <Route path={publicUser.jobs.GRID} element={<JobsGridPage />} />
            <Route path={publicUser.jobs.GRID_MAP} element={<JobsGridMapPage />} />
            <Route path={publicUser.jobs.LIST} element={<JobsListPage />} />
            <Route path={publicUser.jobs.DETAIL1} element={<JobDetail1Page />} />
            <Route path="/job-detail/:id" element={<JobDetail1Page />} />
            <Route path="/job-detail/:param1/:id" element={<JobDetail1Page />} />
            <Route path={publicUser.jobs.DETAIL2} element={<JobDetail2Page />} />
            <Route path={publicUser.jobs.APPLY} element={<ApplyJobPage />} />
            <Route path={publicUser.employer.GRID} element={<EmployersGridPage />} />
            <Route path={publicUser.employer.LIST} element={<EmployersListPage />} />
            <Route path="/emp-detail/:id" element={<EmployersDetail1Page />} />
            <Route path={publicUser.employer.DETAIL2} element={<EmployersDetail2Page />} />
            <Route path={publicUser.pages.ABOUT} element={<AboutUsPage />} />
            <Route path={publicUser.pages.PRICING} element={<PricingPage />} />
            <Route path={publicUser.pages.ERROR404} element={<Error404Page />} />
            <Route path={publicUser.pages.FAQ} element={<FaqPage />} />
            <Route path={publicUser.pages.CONTACT} element={<ContactUsPage />} />
            <Route path={publicUser.pages.MAINTENANCE} element={<UnderMaintenancePage />} />
            <Route path={publicUser.pages.COMING} element={<ComingSoonPage />} />
            <Route path={publicUser.pages.LOGIN} element={<LoginPage />} />
            <Route path={publicUser.pages.LOGIN_CANDIDATE} element={<LoginCandidatePage />} />
            <Route path={publicUser.pages.LOGIN_EMPLOYER} element={<LoginEmployerPage />} />
            <Route path={publicUser.pages.LOGIN_PLACEMENT} element={<LoginPlacementPage />} />
            <Route path={publicUser.pages.SIGNUP_CANDIDATE} element={<SignupCandidatePage />} />
            <Route path={publicUser.pages.SIGNUP_EMPLOYER} element={<SignupEmployerPage />} />
            <Route path={publicUser.pages.SIGNUP_PLACEMENT} element={<SignupPlacementPage />} />
            <Route path={publicUser.pages.ADMIN_LOGIN} element={<AdminLogin />} />
            <Route path={publicUser.pages.SUB_ADMIN_LOGIN} element={<SubAdminLogin />} />
            <Route path={publicUser.pages.FORGOT} element={<ForgotPassword/>} />
            <Route path={publicUser.pages.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path="/create-password" element={<CreatePassword />} />
            <Route path={publicUser.pages.TERMS} element={<TermsConditionsPage />} />
            <Route path={publicUser.pages.PRIVACY} element={<PrivacyPolicyPage />} />
            <Route path={publicUser.pages.SUPPORT} element={<SupportPage />} />
            <Route path={publicUser.pages.TUTORIALS} element={<TutorialsPage />} />
            <Route path={publicUser.pages.ICONS} element={<IconsPage />} />
            <Route path={publicUser.candidate.GRID} element={<CandidateGridPage />} />
            <Route path={publicUser.candidate.LIST} element={<CandidateListPage />} />
            <Route path={publicUser.candidate.DETAIL1} element={<CandidateDetail1Page />} />
            <Route path={publicUser.candidate.DETAIL2} element={<CandidateDetail2Page />} />
            <Route path={publicUser.blog.GRID1} element={<BlogGrid1Page />} />
            <Route path={publicUser.blog.GRID2} element={<BlogGrid2Page />} />
            <Route path={publicUser.blog.GRID3} element={<BlogGrid3Page />} />
            <Route path={publicUser.blog.LIST} element={<BlogListPage />} />
            <Route path={publicUser.blog.DETAIL} element={<BlogDetailPage />} />
            <Route path="*" element={<Error404Page />} />
            </Routes>
        </Suspense>
    )
}

export default PublicUserRoutes;
