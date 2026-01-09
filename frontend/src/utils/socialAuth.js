export const handleFacebookLogin = () => {
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/facebook/callback')}&scope=email`;
};

export const handleGoogleLogin = () => {
    window.location.href = `https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&scope=email%20profile&response_type=code`;
};
