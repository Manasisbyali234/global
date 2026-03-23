const RECAPTCHA_SITE_KEY = "6LfkpJIsAAAAALl9FlSWZbH2YOxH8A50wLNtUSJf";

let recaptchaScriptPromise = null;

const getRecaptchaApi = () => {
  if (window.grecaptcha?.execute && window.grecaptcha?.ready) {
    return window.grecaptcha;
  }

  if (window.grecaptcha?.enterprise?.execute && window.grecaptcha?.enterprise?.ready) {
    return window.grecaptcha.enterprise;
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

const loadRecaptchaScript = () => {
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
    const existingScript = document.querySelector('script[data-recaptcha="global-login-v3"]');

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
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "global-login-v3";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.body.appendChild(script);
  });

  return recaptchaScriptPromise;
};

export const executeLoginRecaptcha = async (action) => {
  const api = await loadRecaptchaScript();

  return new Promise((resolve, reject) => {
    const run = async () => {
      try {
        const token = await api.execute(RECAPTCHA_SITE_KEY, { action });
        if (!token) {
          reject(new Error("Google reCAPTCHA verification failed. Please try again."));
          return;
        }
        resolve(token);
      } catch (error) {
        reject(new Error("Google reCAPTCHA verification failed. Please try again."));
      }
    };

    api.ready(run);
  });
};
