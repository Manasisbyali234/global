const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAndFixData() {
  try {
    const Candidate = require('./models/Candidate');
    const Placement = require('./models/Placement');
    
    console.log('Checking database...');
    
    // Get all students
    const allStudents = await Candidate.find({}).select('name email placementId registrationMethod');
    console.log(`Total students in database: ${allStudents.length}`);
    
    // Get all placement officers
    const allPlacements = await Placement.find({}).select('name email _id');
    console.log(`Total placement officers: ${allPlacements.length}`);
    
    if (allPlacements.length > 0) {
      const placement = allPlacements[0];
      console.log(`Using placement officer: ${placement.name} (${placement.email})`);
      
      // Update students without placementId to link them to this placement officer
      const studentsWithoutPlacement = await Candidate.find({ 
        $or: [
          { placementId: { $exists: false } },
          { placementId: null }
        ]
      });
      
      console.log(`Students without placement ID: ${studentsWithoutPlacement.length}`);
      
      if (studentsWithoutPlacement.length > 0) {
        await Candidate.updateMany(
          { 
            $or: [
              { placementId: { $exists: false } },
              { placementId: null }
            ]
          },
          { 
            $set: { 
              placementId: placement._id,
              registrationMethod: 'placement'
            }
          }
        );
        console.log(`Updated ${studentsWithoutPlacement.length} students with placement ID`);
      }
      
      // Get students for this placement officer
      const placementStudents = await Candidate.find({ placementId: placement._id })
        .select('name email phone course credits');
      
      console.log(`\nStudents for ${placement.name}:`);
      placementStudents.forEach(student => {
        console.log(`- ${student.name} (${student.email}) - Course: ${student.course} - Credits: ${student.credits}`);
      });
      
      console.log(`\nPlacement Officer Login Credentials:`);
      console.log(`Email: ${placement.email}`);
      console.log(`You can login at: http://localhost:3000/placement/login`);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkAndFixData();