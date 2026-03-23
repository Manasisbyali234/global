const fetch = require('node-fetch');

const getRecaptchaFailureMessage = (errorCodes = []) => {
  if (errorCodes.includes('missing-input-secret') || errorCodes.includes('invalid-input-secret')) {
    return 'Google reCAPTCHA secret key is invalid or missing on the server.';
  }

  if (errorCodes.includes('missing-input-response')) {
    return 'Google reCAPTCHA token was not received. Please try again.';
  }

  if (errorCodes.includes('invalid-input-response')) {
    return 'Google reCAPTCHA token is invalid. Please verify that the frontend site key matches the backend secret key.';
  }

  if (errorCodes.includes('timeout-or-duplicate')) {
    return 'Google reCAPTCHA token expired or was already used. Please try again.';
  }

  return 'Google reCAPTCHA verification failed. Please try again.';
};

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

  let response;

  try {
    response = await Promise.race([
      fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('reCAPTCHA verification timeout')), 8000);
      })
    ]);
  } catch (error) {
    return {
      success: false,
      message: 'Unable to verify Google reCAPTCHA right now. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  if (!response || !response.ok) {
    return {
      success: false,
      message: 'Unable to verify Google reCAPTCHA. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  let result;
  try {
    result = await response.json();
  } catch (error) {
    return {
      success: false,
      message: 'Invalid Google reCAPTCHA verification response. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  if (!result.success) {
    console.error('reCAPTCHA verification failed:', {
      expectedAction,
      receivedAction: result.action || null,
      score: result.score,
      hostname: result.hostname || null,
      errorCodes: result['error-codes'] || []
    });

    return {
      success: false,
      message: getRecaptchaFailureMessage(result['error-codes'] || []),
      shouldResetRecaptcha: true
    };
  }

  const allowedActions = Array.isArray(expectedAction) ? expectedAction : [expectedAction];
  if (result.action && allowedActions[0] && !allowedActions.includes(result.action)) {
    console.error('reCAPTCHA action mismatch:', {
      expectedAction: allowedActions,
      receivedAction: result.action,
      score: result.score,
      hostname: result.hostname || null
    });

    return {
      success: false,
      message: 'Google reCAPTCHA action mismatch. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  if (typeof result.score === 'number' && result.score < 0.5) {
    console.error('reCAPTCHA score too low:', {
      expectedAction,
      receivedAction: result.action || null,
      score: result.score,
      hostname: result.hostname || null
    });

    return {
      success: false,
      message: 'Google reCAPTCHA score was too low. Please try again.',
      shouldResetRecaptcha: true
    };
  }

  return { success: true };
};
