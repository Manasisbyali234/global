// `api.postalpincode.in` is currently failing browser TLS validation,
// so this client-side lookup uses a browser-safe source instead.
const GENERIC_PLACE_NAME_PATTERN = /^(extension|extn|road|main road|layout|phase|stage)$/i;

const normalizePlaceName = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const getPlaceScore = (place = {}) => {
  const placeName = normalizePlaceName(place['place name']);
  if (!placeName) return Number.NEGATIVE_INFINITY;

  let score = placeName.length;

  if (/\s/.test(placeName)) score += 5;
  if (!GENERIC_PLACE_NAME_PATTERN.test(placeName)) score += 25;
  if (/\d/.test(placeName)) score -= 5;

  return score;
};

const pickBestPlace = (places = []) => {
  const sortedPlaces = [...places].sort((left, right) => getPlaceScore(right) - getPlaceScore(left));
  return sortedPlaces[0] || null;
};

// Pincode service to fetch location data from pincode
export const fetchLocationFromPincode = async (pincode) => {
  try {
    // Validate pincode format
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw new Error('Invalid pincode format');
    }

    console.log('Fetching location for pincode:', pincode);

    // Use the browser-safe API first to avoid certificate errors in production.
    try {
      const response = await fetch(`https://api.zippopotam.us/in/${pincode}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Pincode API response:', data);

        if (data?.places?.length > 0) {
          const place = pickBestPlace(data.places);
          const placeName = normalizePlaceName(place?.['place name']);
          const state = normalizePlaceName(place?.state);

          const result = {
            success: true,
            location: placeName,
            district: placeName,
            state,
            stateCode: getStateCode(state),
            country: data.country
          };
          console.log('Pincode API success:', result);
          return result;
        }
      }
    } catch (lookupError) {
      console.warn('Pincode API failed:', lookupError);
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
