// Home page- Home16
// Header- Header1
// Job detail page- job-detail1

export const base = {
    PUBLIC_PRE: "",
    CANDIDATE_PRE: "/candidate",
    EMPLOYER_PRE: "/employer",
    ADMIN_PRE: "/admin",
    PLACEMENT_PRE: "/placement"
}

export const publicUser = {
    INITIAL: "/",

    jobs: {
        GRID: "/job-grid",
        GRID_MAP: "/job-grid-with-map",
        LIST: "/job-list",
        DETAIL1: "/job-detail/1",
        APPLY: "/apply-job"
    },
    employer: {
        GRID: "/emp-grid",
        LIST: "/emp-list",
        DETAIL1: "/emp-detail/:id",
    },
    pages: {
        ABOUT:          "/about-us",
        PRICING:        "/pricing",
        ERROR404:       "/error404",
        FAQ:            "/faq",
        CONTACT:        "/contact-us",
        MAINTENANCE:    "/under-maintenance",
        COMING:         "/coming-soon",
        LOGIN:          "/login",
        ADMIN_LOGIN:    "/admin-login",
        SUB_ADMIN_LOGIN: "/sub-admin-login",
        ICONS:          "/icons",
        FORGOT:         "/forgot-password",
        RESET_PASSWORD: "/reset-password/:token",
        TERMS:          "/terms-conditions",
        PRIVACY:        "/privacy-policy",
        SUPPORT:        "/support",
        TUTORIALS:      "/tutorials"
    },
    candidate: {
        GRID: "/can-grid",
        LIST: "/can-list",
        DETAIL1: "/can-detail/1",
    },
    blog: {
        GRID1: "/blog-grid/1",
        LIST: "/blog-list",
        DETAIL: "/blog-detail"
    }
}

export const candidate = {
	INITIAL: "/",
	DASHBOARD: "/dashboard",
	PROFILE: "/profile",
	APPLIED_JOBS: "/applied-jobs",
	STATUS: "/status",
	RESUME: "/my-resume",
	SAVED_JOBS: "/saved-jobs",
	CV_MANAGER: "/cv-manager",
	ALERTS: "/job-alerts",
	CHANGE_PASSWORD: "/change-password",
	CHAT: "/chat",
	ASSESSMENT: "/take-assesments",
	START_ASSESSMENT: "/start-tech-assessment",
	STEP: "/step",
	RESULT: "/assessment-result/:applicationId",
	SUPPORT: "/support",
    TRANSACTIONS: "/transactions"
};

export const employer = {
	INITIAL: "/",
	DASHBOARD: "/dashboard",
	PROFILE: "/profile",
	PROFILE1: "/profile1",
	POST_A_JOB: "/post-job",
	MANAGE_JOBS: "/manage-jobs",
	CREATE_ASSESSMENT: "/create-assessment",
	MANAGE_ASSESSMENT: "/manage-assessment",
	CANDIDATES: "/candidates-list",
	BOOKMARKS: "/bookmarked-resumes",
	PACKAGES: "/packages",
	MESSAGES1: "/messages-style-1",
	RESUME_ALERTS: "/resume-alerts",
	CAN_REVIEW:   "/emp-candidate-review",
    JOB_REVIEW:   "/emp-job-review",
    SUPPORT:      "/support",
    SUPPORT_TICKETS: "/support-tickets",
    TRANSACTIONS: "/transactions"
};

export const admin = {
    INITIAL:        "/",
    DASHBOARD:      "/dashboard",
    CANDIDATES:     "/candidates-list",
    REGISTERED_CANDIDATES: "/registered-candidates",
    CANDIDATE_REVIEW: "/candidate-review/:candidateId",
    CANDIDATE_ADD_EDIT: "/can-add-edit",
    EMPLOYER_JOBS:  "/employers-jobs",
    CREDITS:        "/admin-credit",
    BULK_UPLOAD:    "/bulk-upload",
    JOBS:          "/admin-jobs",
    PAYMENTS:     "/payments",
    CAN_MANAGE:   "/admin-emp-manage",
    CAN_APPROVE:   "/admin-emp-approved",
    CAN_REJECT:   "/admin-emp-rejected",
    EMPLOYER_DETAILS:   "/employer-details/:id",
    PLACEMENT_MANAGE: "/admin-placement-manage",
    PLACEMENT_APPROVE: "/admin-placement-approved",
    PLACEMENT_REJECT: "/admin-placement-rejected",
    PLACEMENT_DETAILS: "/placement-details/:id",
    SUB_ADMIN: "/sub-admin",
    SUB_ADMIN_ADD: "/sub-admin/add",
    SUPPORT_TICKETS: "/support-tickets",
    TRANSACTIONS: "/transactions"
}

export function pubRoute(_route) {
    return base.PUBLIC_PRE + _route;
}

export function empRoute(_route) {
    return base.EMPLOYER_PRE + _route;
}

export function canRoute(_route) {
    return base.CANDIDATE_PRE + _route;
}

export function adminRoute(_route) {
    return base.ADMIN_PRE + _route;
}

export const placement = {
    INITIAL: "/",
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
    STUDENTS: "/students",
    UPLOAD: "/upload-data",
    BATCH_UPLOAD: "/batch-upload"
};

export function placementRoute(_route) {
    return base.PLACEMENT_PRE + _route;
}
