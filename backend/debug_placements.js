const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SubAdmin = require('./models/SubAdmin');
const Placement = require('./models/Placement');

async function debug() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tale_jobportal');
        console.log('Connected to MongoDB');

        const placements = await Placement.find({ isApproved: true })
            .populate('approvedBy');

        console.log('Total approved placements:', placements.length);
        const withApprovedBy = placements.filter(p => p.approvedBy !== null);
        console.log('Placements with non-null approvedBy:', withApprovedBy.length);

        console.log('--- PLACEMENTS DEBUG ---');
        placements.slice(0, 10).forEach(p => {
            console.log(`Placement: ${p.name}`);
            console.log(`- approvedBy (raw): ${p.toObject().approvedBy}`);
            console.log(`- approvedByModel: ${p.approvedByModel}`);
            console.log(`- approvedBy (populated type): ${typeof p.approvedBy}`);
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
