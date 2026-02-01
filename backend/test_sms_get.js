const axios = require('axios');

async function testSMSGet() {
    const mobile = '917019293597';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const name = 'TestUser';
    
    // Testing with V5 API - Query Params (GET)
    // Sometimes variables need to be passed as JSON string in 'variables' param or just as query params
    // Let's try passing directly first as per some docs
    
    const params = {
        template_id: '1707176906650300911',
        mobile: mobile,
        authkey: '0dd10a77284cb72a',
        otp: otp,
        // For GET requests, custom variables sometimes need special handling
        // trying direct param mapping first
        name: name, 
        sid: '33730',
        entity_id: '1701176890983954230',
        sender: 'TALEGL'
    };

    console.log('Testing MSG91 V5 API (GET)...');
    console.log('Params:', JSON.stringify(params, null, 2));

    try {
        const response = await axios.get('https://control.msg91.com/api/v5/otp', { params });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testSMSGet();