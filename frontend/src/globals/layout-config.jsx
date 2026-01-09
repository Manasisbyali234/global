
import Header1 from "../app/common/header/header1";
import Header2 from "../app/common/header/header2";
import Footer1 from "../app/common/footer/footer1";
import Footer2 from "../app/common/footer/footer2";
import Footer3 from "../app/common/footer/footer3";
import Footer4 from "../app/common/footer/footer4";
import { publicUser } from "./route-names";

export function showFloatingMenus(currentpath) {
    switch (currentpath) {
        case publicUser.HOME1:
        case publicUser.HOME2:
        case publicUser.HOME3:
        case publicUser.HOME4:
        case publicUser.HOME5:
        case publicUser.HOME6:
        // case publicUser.HOME7:
        case publicUser.HOME8:
        case publicUser.HOME9:
        case publicUser.HOME10:
        case publicUser.HOME11:
        case publicUser.HOME12:
        case publicUser.HOME13:
        case publicUser.HOME14:
        case publicUser.HOME15:
        case publicUser.HOME16:
        case publicUser.HOME17:
        case publicUser.HOME18:
            return true;
        default:
            return false;
    }
}

export function showHeader(currentpath) {
    if (currentpath === publicUser.pages.MAINTENANCE ||
        currentpath === publicUser.pages.COMING ||
        currentpath === publicUser.pages.LOGIN ||
        currentpath === publicUser.pages.AFTER_LOGIN) {
        return false;
    }
    return true;
}

export function setHeaderType(currentpath) {
    if (currentpath === publicUser.HOME14 ||
        currentpath === publicUser.HOME17) {
        return <Header2 _config={getHeaderConfig(currentpath)} />
    } else {
        return <Header1 _config={getHeaderConfig(currentpath)} />
    }
}

export function showFooter(currentpath) {
    if (currentpath === publicUser.pages.MAINTENANCE ||
        currentpath === publicUser.pages.COMING ||
        currentpath === publicUser.jobs.GRID_MAP) {
        return false;
    }
    return true;
}

export function setFooterType(currentpath) {
    if (currentpath === publicUser.HOME2 ||
        currentpath === publicUser.HOME4 ||
        currentpath === publicUser.HOME8 ||
        currentpath === publicUser.HOME9 ||
        currentpath === publicUser.HOME10 ||
        currentpath === publicUser.HOME13) {
        return <Footer2 />
    } else if (currentpath === publicUser.HOME5 ||
        currentpath === publicUser.HOME6 ||
        currentpath === publicUser.HOME16 ||
        currentpath === publicUser.HOME18) {
        return <Footer3 />
    } else if (currentpath === publicUser.HOME11) {
        return <Footer4 />
    } else {
        return <Footer1 />
    }
}

export function getHeaderConfig(currentpath) {

    switch (currentpath) {
        case publicUser.jobs.GRID_MAP:
        case publicUser.jobs.DETAIL2:
        case publicUser.employer.DETAIL2:
            return {
                style: 'header-full-width',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME3:
        case publicUser.HOME7:
            return {
                style: 'header-style-light',
                nav_button_style: '',
                withLightLogo: true,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME4:
        case publicUser.HOME5:
        case publicUser.HOME9:
            return {
                style: 'header-style-3 no-fixed',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME11:
            return {
                style: 'header-style-3 h-page-11-hdr',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME12:
            return {
                style: 'header-style-3 h-page-12-hdr',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: true,
                withWhiteLogo: false
            }
        case publicUser.HOME13:
            return {
                style: 'header-style-3 h-page-13-hdr no-fixed',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME14:
            return {
                style: 'header-style-3 h-page-14-hdr',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME15:
            return {
                style: 'header-style-3 h-page-15-hdr',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: true
            }
        case publicUser.HOME16:
            return {
                style: 'header-style-3 h-page-16-hdr',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME17:
            return {
                style: 'header-style-3 h-page-14-hdr',
                nav_button_style: 'dark',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        case publicUser.HOME18:
            return {
                style: 'header-style-3 h-page-18-hdr',
                nav_button_style: 'dark',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
        default:
            return {
                style: 'header-style-3',
                nav_button_style: '',
                withLightLogo: false,
                withBlackLogo: false,
                withWhiteLogo: false
            }
    }
}
