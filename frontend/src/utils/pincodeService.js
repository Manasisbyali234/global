// Pincode service to fetch location data from pincode
export const fetchLocationFromPincode = async (pincode) => {
  try {
    // Validate pincode format
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw new Error('Invalid pincode format');
    }

    console.log('Fetching location for pincode:', pincode);

    // Try primary API first
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      console.log('Primary API response:', data);

      if (data && data.length > 0 && data[0].Status === 'Success') {
        const postOffices = data[0].PostOffice;
        const mainPostOffice = postOffices[0];
        
        const village = mainPostOffice.Name;
        const taluka = mainPostOffice.Block || mainPostOffice.Taluk || mainPostOffice.SubDistrict || '';
        const district = mainPostOffice.District;
        const state = mainPostOffice.State;
        
        // Format: Village, Taluka, District
        let locationName = village;
        if (taluka && taluka !== district) {
          locationName += `, ${taluka}`;
        }
        locationName += `, ${district}`;
        
        const result = {
          success: true,
          location: locationName,
          village: village,
          taluka: taluka,
          district: district,
          state: state,
          stateCode: getStateCode(state),
          country: mainPostOffice.Country
        };
        console.log('Primary API success:', result);
        return result;
      }
    } catch (primaryError) {
      console.warn('Primary API failed:', primaryError);
    }

    // Try backup API
    try {
      const backupResponse = await fetch(`https://api.zippopotam.us/in/${pincode}`);
      if (backupResponse.ok) {
        const backupData = await backupResponse.json();
        console.log('Backup API response:', backupData);
        
        if (backupData && backupData.places && backupData.places.length > 0) {
          const place = backupData.places[0];
          const result = {
            success: true,
            location: place['place name'],
            district: place['place name'],
            state: place.state,
            stateCode: getStateCode(place.state),
            country: backupData.country
          };
          console.log('Backup API success:', result);
          return result;
        }
      }
    } catch (backupError) {
      console.warn('Backup API failed:', backupError);
    }

    return {
      success: false,
      message: 'Invalid pincode or location not found'
    };
  } catch (error) {
    console.error('Error fetching location from pincode:', error);
    return {
      success: false,
      message: 'Failed to fetch location data'
    };
  }
};

// Helper function to get state code from state name
const getStateCode = (stateName) => {
  const stateCodeMap = {
    'Andhra Pradesh': 'AP',
    'Arunachal Pradesh': 'AR',
    'Assam': 'AS',
    'Bihar': 'BR',
    'Chhattisgarh': 'CG',
    'Goa': 'GA',
    'Gujarat': 'GJ',
    'Haryana': 'HR',
    'Himachal Pradesh': 'HP',
    'Jharkhand': 'JH',
    'Karnataka': 'KA',
    'Kerala': 'KL',
    'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH',
    'Manipur': 'MN',
    'Meghalaya': 'ML',
    'Mizoram': 'MZ',
    'Nagaland': 'NL',
    'Odisha': 'OD',
    'Punjab': 'PB',
    'Rajasthan': 'RJ',
    'Sikkim': 'SK',
    'Tamil Nadu': 'TN',
    'Telangana': 'TS',
    'Tripura': 'TR',
    'Uttar Pradesh': 'UP',
    'Uttarakhand': 'UK',
    'West Bengal': 'WB',
    'Andaman and Nicobar Islands': 'AN',
    'Chandigarh': 'CH',
    'Dadra and Nagar Haveli and Daman and Diu': 'DH',
    'Delhi': 'DL',
    'Jammu and Kashmir': 'JK',
    'Ladakh': 'LA',
    'Lakshadweep': 'LD',
    'Puducherry': 'PY'
  };

  return stateCodeMap[stateName] || '';
};