const mongoose = require('mongoose');
const Admin = require('./backend/models/Admin');
const SubAdmin = require('./backend/models/SubAdmin');
const Placement = require('./backend/models/Placement');

async function debug() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tale_jobportal');
        console.log('Connected to MongoDB');

        const placements = await Placement.find({ isApproved: true })
            .populate('approvedBy')
            .limit(5);

        console.log('--- PLACEMENTS DEBUG ---');
        placements.forEach(p => {
            console.log(`Placement: ${p.name}`);
            console.log(`- approvedBy (raw): ${p.toObject().approvedBy}`);
            console.log(`- approvedByModel: ${p.approvedByModel}`);
            console.log(`- approvedBy (populated): ${JSON.stringify(p.approvedBy)}`);
            console.log('------------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

debug();
