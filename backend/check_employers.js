const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SubAdmin = require('./models/SubAdmin');
const Employer = require('./models/Employer');

async function debug() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tale_jobportal');
        console.log('Connected to MongoDB');

        const employers = await Employer.find({ isApproved: true })
            .populate('approvedBy')
            .limit(10);

        console.log('Total approved employers:', employers.length);

        console.log('--- EMPLOYERS DEBUG ---');
        employers.forEach(e => {
            console.log(`Company: ${e.companyName}`);
            console.log(`- approvedBy (raw): ${e.toObject().approvedBy}`);
            console.log(`- approvedByModel: ${e.approvedByModel}`);
            console.log(`- approvedBy (populated type): ${typeof e.approvedBy}`);
            console.log(`- approvedBy (populated): ${JSON.stringify(e.approvedBy)}`);
            if (e.approvedBy) {
                console.log(`- Name found: ${e.approvedBy.name || 'NO NAME'}`);
            }
            console.log('------------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debug();
