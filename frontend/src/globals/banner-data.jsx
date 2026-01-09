
import { candidate, canRoute, publicUser, pubRoute } from "./route-names"

export const banner = {
    publicUser: {
        jobs: {
            grid: {
                title: "Search. Apply. Get Hired.",
                crumb: ""
            },
            list: {
                title: "Search. Apply. Get Hired.",
                crumb: "Jobs"
            },
            detail1: {
                title: "IT Department Manager",
                crumb: "Job Detail"
            },
            apply_job: {
                title: "Apply For This Job",
                crumb: "Apply For This Job"
            }
        },
        employer: {
            grid: {
                title: "Top Companies Hiring Now",
                crumb: ""
            },
            list: {
                title: "Top Companies Hiring Now",
                crumb: "Companies"
            },
            detail1: {
                title: "",
                crumb: "Companies"
            }
        },
        candidate: {
            grid: {
                title: "Candidate Grid",
                crumb: "Candidate Grid"
            },
            list: {
                title: "Candidate List",
                crumb: "Candidate List"
            },
            detail1: {
                title: "Candidate Detail",
                crumb: "Candidate Detail"
            }
        },
        pages: {
            about: {
                title: "About Us",
                crumb: ""
            },
            pricing: {
                title: "Pricing Packages",
                crumb: "Pricing"
            },
            faq: {
                title: "Frequently Asked Questions",
                crumb: "FAQ"
            },
            contact: {
                title: "Get in Touch with Us",
                crumb: ""
            },
            icons: {
                title: "Icons",
                crumb: "Icons"
            }
        },
        blogs: {
            grid1: {
                title: "Blog",
                crumb: "Blog"
            },
            grid2: {
                title: "Blog Grid",
                crumb: "Blog Grid"
            },
            grid3: {
                title: "Blog Grid 2",
                crumb: "Blog Grid 2"
            },
            list: {
                title: "Blog List",
                crumb: "Blog List"
            },
            detail: {
                title: "Blog detail",
                crumb: "Blog detail"
            }
        }
    },
    candidate: {
        dashboard: {
            title: "Candidate Dashboard",
            crumb: "Candidate Dashboard"
        },
        profile: {
            title: "Candidate Profile",
            crumb: "Candidate Profile"
        },
        jobs_applied: {
            title: "Candidate Jobs Applied",
            crumb: "Candidate Jobs Applied"
        },
        resume: {
            title: "Candidate Resume",
            crumb: "Candidate Resume"
        },
        jobs_saved: {
            title: "Candidate Saved Jobs",
            crumb: "Candidate Saved Jobs"
        },
        cv_manager: {
            title: "Candidate CV Manager",
            crumb: "Candidate CV Manager"
        },
        alerts: {
            title: "Candidate Jobs Alert",
            crumb: "Candidate Jobs Alert"
        },
        change_password: {
            title: "Candidate Change Password",
            crumb: "Candidate Change Password"
        },
        chat: {
            title: "Candidate Chat",
            crumb: "Candidate Chat"
        }
    }
}

export function showBanner(currentpath) {

    if (currentpath === publicUser.INITIAL ||
        currentpath.startsWith("/index") ||
        currentpath === publicUser.jobs.GRID_MAP ||
        currentpath === publicUser.jobs.DETAIL2 ||
        currentpath === publicUser.employer.DETAIL2 ||
        currentpath === publicUser.candidate.DETAIL2 ||
        currentpath === publicUser.pages.ERROR404 ||
        currentpath === publicUser.pages.MAINTENANCE ||
        currentpath === publicUser.pages.COMING ||
        currentpath === publicUser.pages.LOGIN ||
        currentpath === publicUser.pages.ADMIN_LOGIN ||
        currentpath === publicUser.pages.SUB_ADMIN_LOGIN ||
        currentpath === publicUser.pages.AFTER_LOGIN) {
        return false;
    }
    return true;
}

export function setBanner(currentpath) {
    switch (currentpath) {
        case pubRoute(publicUser.jobs.GRID): {
            return banner.publicUser.jobs.grid
        }
        case pubRoute(publicUser.jobs.LIST): {
            return banner.publicUser.jobs.list
        }
        case pubRoute(publicUser.jobs.DETAIL1): {
            return banner.publicUser.jobs.detail1
        }
        case pubRoute(publicUser.jobs.APPLY): {
            return banner.publicUser.jobs.apply_job
        }
        case pubRoute(publicUser.employer.GRID): {
            return banner.publicUser.employer.grid
        }
        case pubRoute(publicUser.employer.LIST): {
            return banner.publicUser.employer.list
        }
        case pubRoute(publicUser.employer.DETAIL1): {
            return banner.publicUser.employer.detail1
        }
        case pubRoute(publicUser.candidate.GRID): {
            return banner.publicUser.candidate.grid
        }
        case pubRoute(publicUser.candidate.LIST): {
            return banner.publicUser.candidate.list
        }
        case pubRoute(publicUser.candidate.DETAIL1): {
            return banner.publicUser.candidate.detail1
        }
        case pubRoute(publicUser.pages.ABOUT): {
            return banner.publicUser.pages.about
        }
        case pubRoute(publicUser.pages.PRICING): {
            return banner.publicUser.pages.pricing
        }
        case pubRoute(publicUser.pages.FAQ): {
            return banner.publicUser.pages.faq
        }
        case pubRoute(publicUser.pages.CONTACT): {
            return banner.publicUser.pages.contact
        }
        case pubRoute(publicUser.pages.ICONS): {
            return banner.publicUser.pages.icons
        }
        case pubRoute(publicUser.blog.GRID1): {
            return banner.publicUser.blogs.grid1
        }
        case pubRoute(publicUser.blog.GRID2): {
            return banner.publicUser.blogs.grid2
        }
        case pubRoute(publicUser.blog.GRID3): {
            return banner.publicUser.blogs.grid3
        }
        case pubRoute(publicUser.blog.LIST): {
            return banner.publicUser.blogs.list
        }
        case pubRoute(publicUser.blog.DETAIL): {
            return banner.publicUser.blogs.detail
        }
        case canRoute(candidate.DASHBOARD): {
            return banner.candidate.dashboard
        }
        case canRoute(candidate.PROFILE): {
            return banner.candidate.profile
        }
        case canRoute(candidate.APPLIED_JOBS): {
            return banner.candidate.jobs_applied
        }
        case canRoute(candidate.RESUME): {
            return banner.candidate.resume
        }
        case canRoute(candidate.SAVED_JOBS): {
            return banner.candidate.jobs_saved
        }
        case canRoute(candidate.CV_MANAGER): {
            return banner.candidate.cv_manager
        }
        case canRoute(candidate.ALERTS): {
            return banner.candidate.alerts
        }
        case canRoute(candidate.CHANGE_PASSWORD): {
            return banner.candidate.change_password
        }
        case canRoute(candidate.CHAT): {
            return banner.candidate.chat
        }
        default: {
            // Handle dynamic routes
            if (currentpath.startsWith('/emp-detail/')) {
                return banner.publicUser.employer.detail1
            }
            if (currentpath.startsWith('/job-detail/')) {
                return banner.publicUser.jobs.detail1
            }
            return {
                title: "", crumb: ""
            }
        }
    }
}
