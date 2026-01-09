const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function importCSVStudents() {
  try {
    const Candidate = require('./models/Candidate');
    const CandidateProfile = require('./models/CandidateProfile');
    const Placement = require('./models/Placement');
    
    console.log('Starting CSV student import...');
    
    // Find or create a placement officer
    let placement = await Placement.findOne({ email: 'placement@abc.edu' });
    
    if (!placement) {
      placement = await Placement.create({
        name: 'ABC University Placement',
        email: 'placement@abc.edu',
        password: 'password123',
        phone: '9876543200',
        collegeName: 'ABC University',
        status: 'active'
      });
      console.log('Created placement officer:', placement.name);
    } else {
      console.log('Using existing placement officer:', placement.name);
    }

    // Sample student data from your CSV
    const students = [
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '9876543210',
        course: 'Computer Science',
        password: 'password123',
        credits: 100,
        id: 'STU001'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '9876543211',
        course: 'Information Technology',
        password: 'password456',
        credits: 95,
        id: 'STU002'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        phone: '9876543212',
        course: 'Electronics Engineering',
        password: 'password789',
        credits: 90,
        id: 'STU003'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '9876543213',
        course: 'Mechanical Engineering',
        password: 'passwordabc',
        credits: 85,
        id: 'STU004'
      },
      {
        name: 'David Brown',
        email: 'david.brown@email.com',
        phone: '9876543214',
        course: 'Civil Engineering',
        password: 'passworddef',
        credits: 80,
        id: 'STU005'
      }
    ];

    let created = 0;
    let updated = 0;

    for (const studentData of students) {
      try {
        // Check if candidate already exists
        let candidate = await Candidate.findOne({ 
          email: studentData.email.toLowerCase() 
        });
        
        if (candidate) {
          // Update existing candidate with placement info
          candidate.placementId = placement._id;
          candidate.registrationMethod = 'placement';
          candidate.course = studentData.course;
          candidate.credits = studentData.credits;
          await candidate.save();
          console.log(`Updated existing student: ${studentData.name}`);
          updated++;
        } else {
          // Create new candidate
          candidate = await Candidate.create({
            name: studentData.name,
            email: studentData.email.toLowerCase(),
            password: studentData.password,
            phone: studentData.phone,
            course: studentData.course,
            credits: studentData.credits,
            registrationMethod: 'placement',
            placementId: placement._id,
            isVerified: true,
            status: 'active'
          });

          // Create candidate profile
          await CandidateProfile.create({
            candidateId: candidate._id,
            collegeName: 'ABC University',
            education: [{
              degreeName: studentData.course,
              collegeName: 'ABC University',
              scoreType: 'percentage',
              scoreValue: '0'
            }]
          });

          console.log(`Created new student: ${studentData.name}`);
          created++;
        }

      } catch (error) {
        console.error(`Error processing student ${studentData.email}:`, error.message);
      }
    }

    // Verify the data
    const placementStudents = await Candidate.find({ placementId: placement._id })
      .select('name email phone course credits');

    console.log(`\nImport Summary:`);
    console.log(`- Created: ${created} students`);
    console.log(`- Updated: ${updated} students`);
    console.log(`- Total students for ${placement.name}: ${placementStudents.length}`);
    
    console.log(`\nStudents in database for ${placement.name}:`);
    placementStudents.forEach(student => {
      console.log(`- ${student.name} (${student.email}) - ${student.course} - ${student.credits} credits`);
    });

    console.log(`\nLogin Information:`);
    console.log(`URL: http://localhost:3000/placement/login`);
    console.log(`Email: ${placement.email}`);
    console.log(`Password: password123`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Import error:', error);
    mongoose.connection.close();
  }
}

importCSVStudents();