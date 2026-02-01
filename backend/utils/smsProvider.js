const axios = require('axios');

const sendSMS = async (mobile, otp, name) => {
  if (!mobile || !name || !otp) {
    throw new Error("Missing required SMS parameters");
  }

  const firstName = name.trim().split(" ")[0];

  // Format mobile number: remove non-numeric chars
  let formattedMobile = String(mobile).replace(/\D/g, '');
  
  // If number starts with 91 and is 12 digits, remove the leading 91
  // because we are passing country_code: "91" separately
  if (formattedMobile.length === 12 && formattedMobile.startsWith('91')) {
    formattedMobile = formattedMobile.substring(2);
  }

  try {
    console.log('Sending SMS via AuthKey to:', formattedMobile, 'OTP:', otp);

    const response = await axios.post(
      "https://console.authkey.io/restapi/requestjson.php",
      {
        country_code: "91",
        mobile: formattedMobile,
        sender: process.env.SENDER_ID,
        pe_id: process.env.ENTITY_ID,
        template_id: process.env.TEMPLATE_ID,
        sid: process.env.SID,
        name: firstName,
        otp: [otp]
      },
      {
        headers: {
          Authorization: `Basic ${process.env.AUTHKEY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ SMS Sent Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ SMS API call failed:",
      error.response ? error.response.data : error.message
    );
    // Return error object instead of throwing to prevent crashing the flow, or handle as needed
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };