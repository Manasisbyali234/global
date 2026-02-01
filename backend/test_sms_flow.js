const axios = require('axios');

async function testSMSFlow() {
    const mobile = '917019293597';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const name = 'TestUser';
    
    // Testing Flow API
    // This is often more reliable for templates
    
    const payload = {
        template_id: '1707176906650300911',
        sender: 'TALEGL',
        short_url: "0",
        mobiles: mobile,
        name: name,
        otp: otp
    };

    console.log('Testing MSG91 Flow API...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post('https://control.msg91.com/api/v5/flow/', payload, {
            headers: {
                'authkey': '0dd10a77284cb72a',
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testSMSFlow();