const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

// Import models
const Candidate = require('./models/Candidate');
const CandidateProfile = require('./models/CandidateProfile');
const Placement = require('./models/Placement');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function importStudents() {
  try {
    console.log('Starting student import...');
    
    // Find or create a placement officer for the students
    let placement = await Placement.findOne({ email: 'placement@abc.edu' });
    
    if (!placement) {
      placement = await Placement.create({
        name: 'ABC University Placement Officer',
        email: 'placement@abc.edu',
        password: 'password123',
        phone: '9876543200',
        collegeName: 'ABC University',
        status: 'active'
      });
      console.log('Created placement officer:', placement.name);
    }

    const csvFilePath = path.join(__dirname, '..', 'sample-student-data.csv');
    const students = [];

    // Read CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        students.push({
          name: row['Candidate Name'],
          email: row['Email'],
          phone: row['Phone'],
          course: row['Course'],
          password: row['Password'],
          credits: parseInt(row['Credits Assigned']) || 0,
          collegeName: row['College Name'],
          id: row['ID']
        });
      })
      .on('end', async () => {
        console.log(`Found ${students.length} students in CSV`);
        
        let created = 0;
        let skipped = 0;

        for (const studentData of students) {
          try {
            // Check if candidate already exists
            const existingCandidate = await Candidate.findOne({ 
              email: studentData.email.toLowerCase() 
            });
            
            if (existingCandidate) {
              console.log(`Skipping existing student: ${studentData.email}`);
              skipped++;
              continue;
            }

            // Create candidate
            const candidate = await Candidate.create({
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
              collegeName: studentData.collegeName,
              education: [{
                degreeName: studentData.course,
                collegeName: studentData.collegeName,
                scoreType: 'percentage',
                scoreValue: '0'
              }]
            });

            console.log(`Created student: ${studentData.name} (${studentData.email})`);
            created++;

          } catch (error) {
            console.error(`Error creating student ${studentData.email}:`, error.message);
          }
        }

        console.log(`\nImport completed:`);
        console.log(`- Created: ${created} students`);
        console.log(`- Skipped: ${skipped} students`);
        console.log(`- Placement Officer ID: ${placement._id}`);
        
        mongoose.connection.close();
      });

  } catch (error) {
    console.error('Import error:', error);
    mongoose.connection.close();
  }
}

importStudents();