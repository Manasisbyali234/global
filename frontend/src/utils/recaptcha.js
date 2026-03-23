export const RECAPTCHA_SITE_KEY =
  process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6Lf8sJQsAAAAAEspQqReolhtQhqRJVVU2xxdVuNr";

let recaptchaScriptPromise = null;

const getRecaptchaApi = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.grecaptcha?.render && window.grecaptcha?.reset) {
    return window.grecaptcha;
  }

  return null;
};

const waitForRecaptchaApi = (resolve, reject, attempt = 0) => {
  const api = getRecaptchaApi();
  if (api) {
    resolve(api);
    return;
  }

  if (attempt >= 40) {
    recaptchaScriptPromise = null;
    reject(new Error("Google reCAPTCHA could not be initialized. Please try again."));
    return;
  }

  window.setTimeout(() => waitForRecaptchaApi(resolve, reject, attempt + 1), 250);
};

export const loadVisibleRecaptchaScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google reCAPTCHA is only available in the browser."));
  }

  const existingApi = getRecaptchaApi();
  if (existingApi) {
    return Promise.resolve(existingApi);
  }

  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-recaptcha="global-login-v2"]');

    const handleLoad = () => waitForRecaptchaApi(resolve, reject);
    const handleError = () => {
      recaptchaScriptPromise = null;
      reject(new Error("Google reCAPTCHA could not be loaded. Please refresh and try again."));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      handleLoad();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "global-login-v2";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.body.appendChild(script);
  });

  return recaptchaScriptPromise;
};

export const executeLoginRecaptcha = async () => {
  throw new Error("This login flow still uses the legacy reCAPTCHA handler. Use the visible Google reCAPTCHA widget instead.");
};
