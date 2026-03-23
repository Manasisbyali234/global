import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { loadVisibleRecaptchaScript, RECAPTCHA_SITE_KEY } from "../utils/recaptcha";

const GoogleRecaptchaField = forwardRef(function GoogleRecaptchaField(
  {
    onTokenChange,
    onLoadError,
    theme = "light",
    size = "invisible",
    className = ""
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const pendingExecutionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    loadVisibleRecaptchaScript()
      .then((api) => {
        if (!isMounted || !containerRef.current || widgetIdRef.current !== null) {
          return;
        }

        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme,
          size,
          callback: (token) => {
            onTokenChange?.(token || "");
            if (pendingExecutionRef.current?.resolve) {
              pendingExecutionRef.current.resolve(token || "");
              pendingExecutionRef.current = null;
            }
          },
          "expired-callback": () => {
            onTokenChange?.("");
            if (pendingExecutionRef.current?.reject) {
              pendingExecutionRef.current.reject(
                new Error("Google reCAPTCHA expired. Please try again.")
              );
              pendingExecutionRef.current = null;
            }
          },
          "error-callback": () => {
            onTokenChange?.("");
            if (pendingExecutionRef.current?.reject) {
              pendingExecutionRef.current.reject(
                new Error("Google reCAPTCHA failed to load. Please refresh and try again.")
              );
              pendingExecutionRef.current = null;
            }
            onLoadError?.("Google reCAPTCHA failed to load. Please refresh and try again.");
          }
        });
      })
      .catch((error) => {
        onTokenChange?.("");
        onLoadError?.(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [onLoadError, onTokenChange, size, theme]);

  useImperativeHandle(
    ref,
    () => ({
      async execute() {
        if (
          typeof window === "undefined" ||
          widgetIdRef.current === null ||
          !window.grecaptcha?.execute
        ) {
          throw new Error("Google reCAPTCHA could not be initialized. Please refresh and try again.");
        }

        return new Promise((resolve, reject) => {
          pendingExecutionRef.current = { resolve, reject };

          try {
            window.grecaptcha.execute(widgetIdRef.current);
          } catch (error) {
            pendingExecutionRef.current = null;
            reject(new Error("Google reCAPTCHA verification failed. Please try again."));
          }
        });
      },
      reset() {
        if (typeof window === "undefined" || widgetIdRef.current === null || !window.grecaptcha?.reset) {
          onTokenChange?.("");
          return;
        }

        window.grecaptcha.reset(widgetIdRef.current);
        onTokenChange?.("");
      }
    }),
    [onTokenChange]
  );

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
});

export default GoogleRecaptchaField;
