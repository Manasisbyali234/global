const fetch = require('node-fetch');

exports.verifyRecaptchaToken = async (token, expectedAction, remoteIp) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return {
      success: false,
      message: 'Google reCAPTCHA is not configured on the server.',
      shouldResetRecaptcha: false
    };
  }

  if (!token) {
    return {
      success: false,
      message: 'Google reCAPTCHA verification is required.',
      shouldResetRecaptcha: true
    };
  }

  const payload = new URLSearchParams({
    secret: secretKey,
    response: token
  });

  if (remoteIp) {
    payload.append('remoteip', remoteIp);
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  });

  if (!response.ok) {
    return {
      success: false,
      message: 'Unable to verify Google reCAPTCHA. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  const result = await response.json();

  if (!result.success) {
    return {
      success: false,
      message: 'Google reCAPTCHA verification failed. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  const allowedActions = Array.isArray(expectedAction) ? expectedAction : [expectedAction];
  if (result.action && allowedActions[0] && !allowedActions.includes(result.action)) {
    return {
      success: false,
      message: 'Google reCAPTCHA action mismatch. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  if (typeof result.score === 'number' && result.score < 0.5) {
    return {
      success: false,
      message: 'Google reCAPTCHA score was too low. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  return { success: true };
};
