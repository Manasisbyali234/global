// Improved viewDocumentImage function with better error handling
const viewDocumentImage = async (employerId, documentType) => {
    try {
        console.log(`Attempting to view document: ${documentType} for employer: ${employerId}`);
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }

        const url = `${API_BASE_URL}/admin/employers/${employerId}/view-document/${documentType}`;
        console.log(`Request URL: ${url}`);
        
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'image/*,application/pdf,*/*'
            }
        });
        
        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            
            if (response.status === 404) {
                showError('Document not found or not uploaded yet.');
            } else if (response.status === 401) {
                showError('Authentication failed. Please login again.');
            } else if (response.status === 500) {
                showError('Server error while loading document. Please try again.');
            } else {
                showError(`Failed to load document: ${response.status} ${response.statusText}`);
            }
            return;
        }

        const contentType = response.headers.get('content-type');
        console.log(`Content-Type: ${contentType}`);
        
        if (!contentType || (!contentType.startsWith('image/') && !contentType.startsWith('application/pdf'))) {
            console.warn('Unexpected content type:', contentType);
        }

        const blob = await response.blob();
        console.log(`Blob created, size: ${blob.size} bytes, type: ${blob.type}`);
        
        if (blob.size === 0) {
            showError('Document appears to be empty.');
            return;
        }

        const imageUrl = window.URL.createObjectURL(blob);
        console.log('Object URL created:', imageUrl);
        
        setCurrentImage(imageUrl);
        setCurrentImageType(blob.type);
        setShowImageModal(true);
        
        // Clean up the URL after a delay to prevent memory leaks
        setTimeout(() => {
            window.URL.revokeObjectURL(imageUrl);
        }, 60000); // 1 minute
        
    } catch (error) {
        console.error('Error loading document image:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Network error. Please check your internet connection and try again.');
        } else if (error.name === 'AbortError') {
            showError('Request was cancelled. Please try again.');
        } else {
            showError(`Error loading document: ${error.message}`);
        }
    }
};