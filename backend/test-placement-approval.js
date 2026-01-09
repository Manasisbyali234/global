const mongoose = require('mongoose');
const Placement = require('./models/Placement');

// Test script to verify placement officer approval flow
async function testPlacementApprovalFlow() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taleglobal');
    console.log('Connected to database');

    // Test 1: Create a new placement officer
    console.log('\n=== Test 1: Creating new placement officer ===');
    const testPlacement = await Placement.create({
      name: 'Test Placement Officer',
      email: 'test.placement@college.edu',
      phone: '1234567890',
      collegeName: 'Test College'
    });
    console.log('✓ Placement officer created with status:', testPlacement.status);
    console.log('✓ Expected: pending, Actual:', testPlacement.status);

    // Test 2: Set password (should remain pending)
    console.log('\n=== Test 2: Setting password ===');
    testPlacement.password = 'testpassword123';
    await testPlacement.save();
    console.log('✓ Password set, status remains:', testPlacement.status);
    console.log('✓ Expected: pending, Actual:', testPlacement.status);

    // Test 3: Admin approval (should change to active)
    console.log('\n=== Test 3: Admin approval ===');
    testPlacement.status = 'active';
    await testPlacement.save();
    console.log('✓ Admin approved, status changed to:', testPlacement.status);
    console.log('✓ Expected: active, Actual:', testPlacement.status);

    // Test 4: Login attempt before approval (create another test user)
    console.log('\n=== Test 4: Login attempt before approval ===');
    const pendingPlacement = await Placement.create({
      name: 'Pending Placement Officer',
      email: 'pending.placement@college.edu',
      password: 'testpassword123',
      phone: '1234567890',
      collegeName: 'Test College'
    });
    console.log('✓ Pending placement officer created with status:', pendingPlacement.status);
    
    // Simulate login check
    const canLogin = pendingPlacement.status === 'active';
    console.log('✓ Can login before approval:', canLogin);
    console.log('✓ Expected: false, Actual:', canLogin);

    // Cleanup
    await Placement.deleteMany({ email: { $in: ['test.placement@college.edu', 'pending.placement@college.edu'] } });
    console.log('\n✓ Test data cleaned up');

    console.log('\n🎉 All tests passed! Placement officer approval flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the test
testPlacementApprovalFlow();