const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Employer = require('./models/Employer');
const Placement = require('./models/Placement');

async function fix() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tale_jobportal');
        console.log('Connected to MongoDB');

        // Find a default super-admin
        const defaultAdmin = await Admin.findOne({ role: 'super-admin' }) || await Admin.findOne();
        
        if (!defaultAdmin) {
            console.log('No admin found to set as default approver.');
            process.exit(0);
        }

        console.log(`Using admin: ${defaultAdmin.name} (${defaultAdmin._id}) as default fallback`);

        // Fix Employers
        const employerResult = await Employer.updateMany(
            { isApproved: true, approvedBy: { $exists: false } },
            { 
                $set: { 
                    approvedBy: defaultAdmin._id,
                    approvedByModel: 'Admin'
                } 
            }
        );
        console.log(`Updated ${employerResult.modifiedCount} employers`);

        // Fix Placements
        const placementResult = await Placement.updateMany(
            { isApproved: true, approvedBy: { $exists: false } },
            { 
                $set: { 
                    approvedBy: defaultAdmin._id,
                    approvedByModel: 'Admin'
                } 
            }
        );
        console.log(`Updated ${placementResult.modifiedCount} placements`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

fix();
