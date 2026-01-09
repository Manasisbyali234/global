// PDF Preview Diagnostic Script
// Run this in the browser console on the employer details page to debug PDF issues

console.log('=== PDF Preview Diagnostic Tool ===');

// Check if we're on the right page
if (!window.location.href.includes('admin/employer-details')) {
    console.warn('⚠️ This script should be run on the employer details page');
}

// Function to test PDF preview
async function testPDFPreview(employerId, documentType) {
    console.log(`🔍 Testing PDF preview for employer ${employerId}, document: ${documentType}`);
    
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        console.error('❌ No admin token found');
        return;
    }
    
    const url = `${API_BASE_URL}/admin/employers/${employerId}/view-document/${documentType}`;
    console.log(`📡 Request URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'image/*,application/pdf,*/*'
            }
        });
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response Error:', errorText);
            return;
        }
        
        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        
        console.log(`📄 Content-Type: ${contentType}`);
        console.log(`📦 Blob Size: ${blob.size} bytes`);
        console.log(`🏷️ Blob Type: ${blob.type}`);
        
        if (blob.size === 0) {
            console.error('❌ Blob is empty');
            return;
        }
        
        // Create object URL and test
        const objectUrl = window.URL.createObjectURL(blob);
        console.log(`🔗 Object URL created: ${objectUrl.substring(0, 50)}...`);
        
        // Test if it's a valid PDF
        if (contentType && contentType.includes('pdf')) {
            console.log('✅ Document is a PDF');
            
            // Try to open in new tab
            const testWindow = window.open(objectUrl, '_blank');
            if (testWindow) {
                console.log('✅ PDF opened in new tab successfully');
                setTimeout(() => testWindow.close(), 3000);
            } else {
                console.error('❌ Failed to open PDF in new tab (popup blocked?)');
            }
        } else {
            console.log('ℹ️ Document is not a PDF, likely an image');
        }
        
        // Clean up
        setTimeout(() => {
            window.URL.revokeObjectURL(objectUrl);
            console.log('🧹 Object URL cleaned up');
        }, 5000);
        
    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

// Function to check browser PDF support
function checkBrowserPDFSupport() {
    console.log('🌐 Checking browser PDF support...');
    
    // Check if PDF.js is available
    if (window.pdfjsLib) {
        console.log('✅ PDF.js library is available');
    } else {
        console.log('⚠️ PDF.js library not detected');
    }
    
    // Check navigator plugins
    const plugins = Array.from(navigator.plugins);
    const pdfPlugin = plugins.find(plugin => 
        plugin.name.toLowerCase().includes('pdf') || 
        plugin.description.toLowerCase().includes('pdf')
    );
    
    if (pdfPlugin) {
        console.log('✅ PDF plugin found:', pdfPlugin.name);
    } else {
        console.log('⚠️ No PDF plugin detected');
    }
    
    // Test iframe PDF support
    const testIframe = document.createElement('iframe');
    testIframe.style.display = 'none';
    testIframe.src = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDQKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjE3NQolJUVPRgo=';
    
    document.body.appendChild(testIframe);
    
    setTimeout(() => {
        try {
            const iframeDoc = testIframe.contentDocument || testIframe.contentWindow.document;
            if (iframeDoc && iframeDoc.body) {
                console.log('✅ Iframe PDF support appears to work');
            } else {
                console.log('⚠️ Iframe PDF support may be limited');
            }
        } catch (e) {
            console.log('⚠️ Cannot access iframe content (security restrictions)');
        }
        document.body.removeChild(testIframe);
    }, 1000);
}

// Function to get current employer ID from URL
function getCurrentEmployerId() {
    const match = window.location.pathname.match(/\/admin\/employer-details\/([^\/]+)/);
    return match ? match[1] : null;
}

// Main diagnostic function
function runDiagnostics() {
    console.log('🚀 Running PDF Preview Diagnostics...');
    
    checkBrowserPDFSupport();
    
    const employerId = getCurrentEmployerId();
    if (employerId) {
        console.log(`👤 Current Employer ID: ${employerId}`);
        
        // Test common document types
        const documentTypes = ['panCardImage', 'cinImage', 'gstImage', 'certificateOfIncorporation'];
        
        console.log('📋 Available test functions:');
        console.log('- testPDFPreview(employerId, documentType)');
        console.log('- checkBrowserPDFSupport()');
        console.log('');
        console.log('Example usage:');
        documentTypes.forEach(docType => {
            console.log(`testPDFPreview('${employerId}', '${docType}');`);
        });
        
    } else {
        console.log('⚠️ Could not extract employer ID from URL');
    }
}

// Export functions to global scope for manual testing
window.testPDFPreview = testPDFPreview;
window.checkBrowserPDFSupport = checkBrowserPDFSupport;
window.runPDFDiagnostics = runDiagnostics;

// Auto-run diagnostics
runDiagnostics();

console.log('✅ PDF Preview Diagnostic Tool loaded. Use runPDFDiagnostics() to run again.');