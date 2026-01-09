const XLSX = require('xlsx');

const exportCandidatesToExcel = (candidates) => {
    const exportData = candidates.map(candidate => ({
        'Name': candidate.name || '',
        'Email': candidate.email || '',
        'Phone': candidate.phone || '',
        'Status': candidate.status || '',
        'Credits': candidate.credits || 0,
        'Registration Date': candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = { exportCandidatesToExcel };
