// Test script to verify placement profile update functionality
const mongoose = require('mongoose');
require('dotenv').config();

const Placement = require('./models/Placement');

async function testPlacementfileUpdate() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find a placement officer to test with
    const placement = await Placement.findOne().select('_id name firstName lastName email phone collegeName');
    
    if (!placement) {
      console.log('No placement officer found in database');
      return;
    }

    console.log('Found placement officer:', {
      id: placement._id,
      name: placement.name,
      firstName: placement.firstName,
      lastName: placement.lastName,
      email: placement.email,
      phone: placement.phone,
      collegeName: placement.collegeName
    });

    // Test update
    const updateData = {
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      collegeName: 'Test College Updated'
    };

    console.log('Testing update with data:', updateData);

    const updatedPlacement = await Placement.findByIdAndUpdate(
      placement._id,
      { 
        $set: {
          name: `${updateData.firstName} ${updateData.lastName}`,
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          collegeName: updateData.collegeName
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('Update successful:', {
      id: updatedPlacement._id,
      name: updatedPlacement.name,
      firstName: updatedPlacement.firstName,
      lastName: updatedPlacement.lastName,
      phone: updatedPlacement.phone,
      collegeName: updatedPlacement.collegeName
    });

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testPlacementfileUpdate();