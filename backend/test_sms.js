const axios = require('axios');

async function testSMS() {
    const mobile = '917019293597';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const name = 'TestUser';
    
    // Testing with V5 API - JSON Payload (POST)
    const paramsV5 = {
        template_id: '1707176906650300911',
        mobile: mobile,
        authkey: '0dd10a77284cb72a',
        otp: otp,
        name: name, // This maps to {#name#} in template
        sid: '33730', // This might be sender_id or similar
        entity_id: '1701176890983954230',
        sender: 'TALEGL'
    };

    console.log('Testing MSG91 V5 API (POST)...');
    console.log('Params:', JSON.stringify(paramsV5, null, 2));

    try {
        const response = await axios.post('https://control.msg91.com/api/v5/otp', paramsV5, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testSMS();