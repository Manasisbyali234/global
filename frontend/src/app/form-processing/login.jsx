import { formType } from "../../globals/constants";

function processLogin(formData, result) {

    if(isValid(formData.username) && isValid(formData.password)) {
        // Remove hardcoded credentials - authentication should be handled by backend
        result(false);
    }
}

function isValid(value) {
    return value !== undefined 
    && value !== null 
    && value !== "";
}

export default processLogin;
