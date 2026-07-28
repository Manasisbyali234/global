require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const MOBILE = '9008599697'; // Default admin mobile
const OTP = '123456';
const NAME = 'Admin';

const printEnvCheck = () => {
  console.log('\n========== ENV VARIABLES CHECK ==========');
  const vars = ['AUTHKEY_API_KEY', 'SENDER_ID', 'TEMPLATE_ID', 'ENTITY_ID', 'SID'];
  let allPresent = true;
  vars.forEach(v => {
    const val = process.env[v];
    if (!val) {
      console.log(`❌ MISSING: ${v}`);
      allPresent = false;
    } else {
      console.log(`✅ ${v} = ${val}`);
    }
  });
  console.log('=========================================\n');
  return allPresent;
};

const testSMS = async () => {
  console.log('\n========== SMS OTP TEST SCRIPT ==========');
  console.log(`📱 Target Mobile : ${MOBILE}`);
  console.log(`🔑 OTP           : ${OTP}`);
  console.log(`👤 Name          : ${NAME}`);
  console.log('=========================================\n');

  const envOk = printEnvCheck();
  if (!envOk) {
    console.error('❌ One or more ENV variables are missing. Fix .env and retry.\n');
    process.exit(1);
  }

  // Format mobile
  let formattedMobile = String(MOBILE).replace(/\D/g, '');
  if (formattedMobile.length === 12 && formattedMobile.startsWith('91')) {
    formattedMobile = formattedMobile.substring(2);
  }

  const params = new URLSearchParams({
    authkey: process.env.AUTHKEY_API_KEY,
    mobile: formattedMobile,
    country_code: '91',
    sid: process.env.SID,
    otp: OTP,
    name: NAME,
    pe_id: process.env.ENTITY_ID,
    template_id: process.env.TEMPLATE_ID,
    sender: process.env.SENDER_ID
  });

  const url = `https://console.authkey.io/api/v5/index.php?${params.toString()}`;

  console.log('📤 Sending request to AuthKey...');
  console.log('URL     :', url);
  console.log('');
  console.log('💡 To test directly on the server, run:');
  console.log(`   curl -s "${url}"`);
  console.log('');

  try {
    const response = await axios.get(url, { timeout: 15000 });

    console.log('📥 HTTP Status  :', response.status);
    console.log('📥 Raw Response :', JSON.stringify(response.data, null, 2));

    const data = response.data;

    if (!data) {
      console.error('\n❌ RESULT: Empty response from AuthKey.\n');
      process.exit(1);
    }

    // AuthKey success indicators
    const isSuccess =
      data.type === 'success' ||
      data.status === 'success' ||
      (data.message_id && data.type !== 'error') ||
      (Array.isArray(data) && data[0]?.type === 'success');

    if (isSuccess) {
      console.log('\n✅ RESULT: SMS sent successfully! Check mobile', MOBILE, 'for OTP.\n');
    } else {
      console.error('\n❌ RESULT: AuthKey returned an error.');
      console.error('   type    :', data.type);
      console.error('   message :', data.message || data.msg || 'No message');
      console.error('\n💡 Common fixes:');
      console.error('   - Invalid AUTHKEY_API_KEY  → Login to console.authkey.io and copy the correct key');
      console.error('   - Invalid TEMPLATE_ID      → Must match the approved DLT template exactly');
      console.error('   - Invalid SENDER_ID        → Must be 6-char registered sender ID');
      console.error('   - Invalid SID              → Check your AuthKey campaign/service ID');
      console.error('   - Insufficient balance     → Recharge your AuthKey account\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ RESULT: Request to AuthKey failed.');
    if (err.response) {
      console.error('   HTTP Status :', err.response.status);
      console.error('   Response    :', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('   Error       :', err.message);
    }
    console.error('\n💡 Check your internet connection or AuthKey service status.\n');
    process.exit(1);
  }
};

testSMS();
