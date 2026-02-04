const baseUrl = process.env.PUBLIC_URL
export const default_skin = "8"

export const popupType = {
    DELETE: "DELETE",
    LOGOUT: "LOGOUT"
}

export const formType = {
    LOGIN_CANDIDATE: "LOGIN_CANDIDATE",
    LOGIN_EMPLOYER: "LOGIN_EMPLOYER"
}

export function publicUrlFor(path) {
    return baseUrl + "/assets/" + path;
}

export function loadScript(src, fromPublic) {
    return new Promise(function (resolve, reject) {
        const scriptSrc = (fromPublic === undefined || fromPublic == null || fromPublic) ? publicUrlFor(src) : src;
        const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
        if (existingScript) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = scriptSrc;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
    });
};

export function setMenuActive(currentpath, path) {
    return (currentpath === path) ? "active": "";
}

export function applyDefaultSkinStyle() {
    updateSkinStyle(default_skin, true, false);
}

export function updateSkinStyle(skin, headerLogoLight, footerLogoLight) {
    var _skin_style = document.getElementById("skin_style");
    var _skin_header_logo = document.getElementById("skin_header_logo");
    var _skin_header_logo_light = document.getElementById("skin_header_logo_light");
    var _skin_footer_light_logo = document.getElementById("skin_footer_light_logo");
    var _skin_page_logo = document.getElementById("skin_page_logo");
    var _skin_maintain_logo = document.getElementById("skin_maintain_logo");
    var _skin_header_inner_logo_12 = document.getElementById("skin_header_inner_logo_12");
    var _skin_header_inner_logo_15 = document.getElementById("skin_header_inner_logo_15");
    const _logo = skin == '8' ? publicUrlFor('images/skins-logo/logo-skin-8.gif') : publicUrlFor('images/skins-logo/logo-skin-' + skin + '.png');
    const _logo_light = publicUrlFor('images/logo-light-3.png');
    const _logo_white = publicUrlFor('images/logo-white.png');

    if (_skin_style)
        _skin_style.href = publicUrlFor('css/skins-type/skin-' + skin + '.css');

    if (_skin_header_logo)
        _skin_header_logo.src = _logo;

    if (_skin_header_logo_light) // initially light, on switcher change => it should change
        _skin_header_logo_light.src = headerLogoLight ? _logo_light : _logo;

    if (_skin_footer_light_logo)
        _skin_footer_light_logo.src = footerLogoLight ? _logo_white : _logo;

    if (_skin_page_logo)
        _skin_page_logo.src = _logo;

    if (_skin_maintain_logo)
        _skin_maintain_logo.src = publicUrlFor('images/skins-logo/mainten-logo-' + skin + '.png');

    if (_skin_header_inner_logo_12)
        _skin_header_inner_logo_12.src = publicUrlFor('images/skins-logo/logo-all.png');

    if (_skin_header_inner_logo_15)
        _skin_header_inner_logo_15.src = publicUrlFor('images/skins-logo/logo-white.png');
}
