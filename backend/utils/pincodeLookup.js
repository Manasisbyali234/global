const fetch = require('node-fetch');

const REQUEST_TIMEOUT_MS = 10000;
const GENERIC_PLACE_NAME_PATTERN = /^(extension|extn|road|main road|layout|phase|stage)$/i;

const normalizePlaceName = (value = '') => String(value).replace(/\s+/g, ' ').trim();
const normalizeStateKey = (value = '') => String(value)
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[().,-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

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

const areSamePlace = (left = '', right = '') => normalizePlaceName(left).toLowerCase() === normalizePlaceName(right).toLowerCase();

const getStateCode = (stateName) => {
  const stateCodeMap = {
    'andhra pradesh': 'AP',
    'arunachal pradesh': 'AR',
    'assam': 'AS',
    'bihar': 'BR',
    'chhattisgarh': 'CG',
    'goa': 'GA',
    'gujarat': 'GJ',
    'haryana': 'HR',
    'himachal pradesh': 'HP',
    'jharkhand': 'JH',
    'karnataka': 'KA',
    'kerala': 'KL',
    'madhya pradesh': 'MP',
    'maharashtra': 'MH',
    'manipur': 'MN',
    'meghalaya': 'ML',
    'mizoram': 'MZ',
    'nagaland': 'NL',
    'odisha': 'OD',
    'orissa': 'OD',
    'punjab': 'PB',
    'rajasthan': 'RJ',
    'sikkim': 'SK',
    'tamil nadu': 'TN',
    'telangana': 'TS',
    'tripura': 'TR',
    'uttar pradesh': 'UP',
    'uttarakhand': 'UK',
    'uttaranchal': 'UK',
    'west bengal': 'WB',
    'andaman and nicobar islands': 'AN',
    'andaman and nicobar': 'AN',
    'chandigarh': 'CH',
    'dadra and nagar haveli and daman and diu': 'DH',
    'dadra and nagar haveli': 'DH',
    'daman and diu': 'DH',
    'delhi': 'DL',
    'nct of delhi': 'DL',
    'national capital territory of delhi': 'DL',
    'jammu and kashmir': 'JK',
    'jammu kashmir': 'JK',
    'ladakh': 'LA',
    'lakshadweep': 'LD',
    'puducherry': 'PY',
    'pondicherry': 'PY'
  };

  return stateCodeMap[normalizeStateKey(stateName)] || '';
};

const buildPostalPincodeResult = (payload) => {
  const firstResult = Array.isArray(payload) ? payload[0] : null;
  const postOffices = Array.isArray(firstResult?.PostOffice) ? firstResult.PostOffice : [];
  const mainPostOffice = postOffices[0];

  if (!mainPostOffice || firstResult?.Status !== 'Success') {
    return null;
  }

  const village = normalizePlaceName(mainPostOffice.Name);
  const taluka = normalizePlaceName(
    mainPostOffice.Block || mainPostOffice.Taluk || mainPostOffice.SubDistrict || ''
  );
  const district = normalizePlaceName(mainPostOffice.District);
  const state = normalizePlaceName(mainPostOffice.State);

  let location = village || district;
  if (taluka && !areSamePlace(taluka, village) && !areSamePlace(taluka, district)) {
    location = location ? `${location}, ${taluka}` : taluka;
  }
  if (district && !areSamePlace(district, village) && !location.toLowerCase().endsWith(district.toLowerCase())) {
    location = location ? `${location}, ${district}` : district;
  }

  return {
    location: location || village || district,
    village,
    taluka,
    district: district || village,
    state,
    stateCode: getStateCode(state),
    country: normalizePlaceName(mainPostOffice.Country || 'India') || 'India'
  };
};

const buildZippopotamResult = (payload) => {
  const places = Array.isArray(payload?.places) ? payload.places : [];
  const place = pickBestPlace(places);
  const placeName = normalizePlaceName(place?.['place name']);
  const state = normalizePlaceName(place?.state);

  if (!placeName) {
    return null;
  }

  return {
    location: placeName,
    district: placeName,
    state,
    stateCode: getStateCode(state),
    country: normalizePlaceName(payload?.country || 'India') || 'India'
  };
};

const providers = [
  {
    name: 'postalpincode',
    urlFor: (pincode) => `https://api.postalpincode.in/pincode/${pincode}`,
    parse: buildPostalPincodeResult
  },
  {
    name: 'zippopotam',
    urlFor: (pincode) => `https://api.zippopotam.us/in/${pincode}`,
    parse: buildZippopotamResult
  }
];

const fetchProviderPayload = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    },
    timeout: REQUEST_TIMEOUT_MS
  });

  return response;
};

const lookupIndianPincode = async (pincode) => {
  if (!/^\d{6}$/.test(String(pincode || ''))) {
    return {
      success: false,
      statusCode: 400,
      message: 'Invalid pincode format'
    };
  }

  const failures = [];

  for (const provider of providers) {
    try {
      const response = await fetchProviderPayload(provider.urlFor(pincode));

      if (!response.ok) {
        failures.push({
          provider: provider.name,
          type: response.status === 404 ? 'not_found' : 'status',
          status: response.status
        });
        continue;
      }

      const payload = await response.json();
      const parsedResult = provider.parse(payload);

      if (parsedResult) {
        return {
          success: true,
          source: provider.name,
          ...parsedResult
        };
      }

      failures.push({
        provider: provider.name,
        type: 'no_match'
      });
    } catch (error) {
      failures.push({
        provider: provider.name,
        type: 'network',
        message: error.message
      });
    }
  }

  const onlyMissingMatches =
    failures.length > 0 && failures.every((failure) => failure.type === 'not_found' || failure.type === 'no_match');

  return {
    success: false,
    statusCode: onlyMissingMatches ? 404 : 502,
    message: onlyMissingMatches
      ? 'Invalid pincode or location not found'
      : 'Failed to fetch location data'
  };
};

module.exports = {
  lookupIndianPincode
};
