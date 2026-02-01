
const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const sendSMS = async (mobile, name, otp) => {
  const firstName = name.trim().split(" ")[0];
  
  // Format mobile number: remove non-numeric chars
  let formattedMobile = String(mobile).replace(/\D/g, '');
  
  // If number starts with 91 and is 12 digits, remove the leading 91
  if (formattedMobile.length === 12 && formattedMobile.startsWith('91')) {
    formattedMobile = formattedMobile.substring(2);
  }

  console.log('--- Configuration ---');
  console.log('URL: https://console.authkey.io/restapi/requestjson.php');
  console.log('AuthKey: ', process.env.AUTHKEY_API_KEY ? 'Set' : 'Missing');
  console.log('Sender ID: ', process.env.SENDER_ID);
  console.log('Entity ID: ', process.env.ENTITY_ID);
  console.log('Template ID: ', process.env.TEMPLATE_ID);
  console.log('SID: ', process.env.SID);
  console.log('---------------------');
  
  console.log(`Attempting to send SMS to: ${formattedMobile} (Country Code: 91)`);
  console.log(`Variables - Name: ${firstName}, OTP: ${otp}`);

  try {
    const payload = {
        country_code: "91",
        mobile: formattedMobile,
        sender: process.env.SENDER_ID,
        pe_id: process.env.ENTITY_ID,
        template_id: process.env.TEMPLATE_ID,
        sid: process.env.SID,
        name: firstName,
        otp: otp
      };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      "https://console.authkey.io/restapi/requestjson.php",
      payload,
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
    return { success: false, error: error.message };
  }
};

// Test Execution
// Using one of the numbers from the logs
const TEST_MOBILE = "9392709385"; 
const TEST_NAME = "Sai";
const TEST_OTP = "123456";

sendSMS(TEST_MOBILE, TEST_NAME, TEST_OTP);
