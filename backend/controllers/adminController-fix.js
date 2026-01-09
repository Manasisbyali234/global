// Fixed viewDocument function for better error handling and debugging
exports.viewDocument = async (req, res) => {
  try {
    const { employerId, documentType } = req.params;
    
    console.log(`Viewing document: ${documentType} for employer: ${employerId}`);
    
    const profile = await EmployerProfile.findOne({ employerId });
    if (!profile) {
      console.log('Profile not found for employer:', employerId);
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    let base64Data = profile[documentType];
    if (!base64Data) {
      console.log(`Document ${documentType} not found in profile`);
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    console.log(`Document found, data length: ${base64Data.length}`);
    console.log(`Document starts with: ${base64Data.substring(0, 50)}`);

    let buffer, mimeType;
    
    try {
      if (base64Data.startsWith('data:')) {
        const result = base64ToBuffer(base64Data);
        buffer = result.buffer;
        mimeType = result.mimeType;
        console.log(`Processed with base64ToBuffer, mimeType: ${mimeType}`);
      } else {
        // Handle legacy base64 without data URL prefix
        buffer = Buffer.from(base64Data, 'base64');
        mimeType = 'image/jpeg'; // Default fallback
        console.log('Processed as legacy base64, using default mimeType: image/jpeg');
      }

      console.log(`Buffer created, size: ${buffer.length} bytes`);

      // Set appropriate headers
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      
      console.log('Sending document response');
      res.send(buffer);
    } catch (bufferError) {
      console.error('Error processing document buffer:', bufferError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing document data',
        error: bufferError.message 
      });
    }
  } catch (error) {
    console.error('Error in viewDocument:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};