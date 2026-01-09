export const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Server returned ${response.status}: Expected JSON but got ${contentType || 'unknown'}`);
  }
  
  return await response.json();
};

export const safeApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse(response);
  } catch (error) {
    if (error.message.includes('Unexpected token')) {
      
      throw new Error('API server is not responding correctly. Please check if the backend is running.');
    }
    throw error;
  }
};
