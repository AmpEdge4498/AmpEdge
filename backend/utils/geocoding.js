/**
 * AmpEdge — Reverse Geocoding Utility
 * Uses Google Maps Geocoding API to convert coordinates to street addresses.
 * Falls back to formatted coordinates if API key is missing or request fails.
 */

const https = require('https');
const logger = require('./logger');

// Simple in-memory cache to reduce API calls
const geocodeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse geocoding response'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Reverse geocode coordinates to a structured address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Structured address { street, area, city, state, pincode, formattedAddress }
 */
async function reverseGeocode(lat, lng) {
  // Round to 4 decimal places for cache key (~11m precision)
  const cacheKey = `${parseFloat(lat).toFixed(4)},${parseFloat(lng).toFixed(4)}`;

  // Check cache first
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Fallback if no API key
  if (!apiKey || apiKey === 'your_google_maps_api_key') {
    const fallback = buildFallbackAddress(lat, lng);
    geocodeCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return fallback;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en&result_type=street_address|route|locality`;
    const response = await makeRequest(url);

    if (response.status === 'OK' && response.results && response.results.length > 0) {
      const result = response.results[0];
      const address = parseGoogleAddress(result);
      address.formattedAddress = result.formatted_address;
      geocodeCache.set(cacheKey, { data: address, timestamp: Date.now() });
      return address;
    }

    logger.warn('Geocoding returned no results', { lat, lng, status: response.status });
    const fallback = buildFallbackAddress(lat, lng);
    geocodeCache.set(cacheKey, { data: fallback, timestamp: Date.now() });
    return fallback;
  } catch (error) {
    logger.error('Geocoding API error', { error: error.message, lat, lng });
    return buildFallbackAddress(lat, lng);
  }
}

/**
 * Parse Google Maps address components into structured fields
 */
function parseGoogleAddress(result) {
  const components = result.address_components || [];
  const address = {
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    formattedAddress: result.formatted_address || '',
  };

  for (const comp of components) {
    const types = comp.types || [];
    if (types.includes('route')) {
      address.street = comp.long_name;
    } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
      address.area = comp.long_name;
    } else if (types.includes('locality')) {
      address.city = comp.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      address.state = comp.long_name;
    } else if (types.includes('postal_code')) {
      address.pincode = comp.long_name;
    }
  }

  return address;
}

/**
 * Build a fallback address when geocoding is unavailable
 */
function buildFallbackAddress(lat, lng) {
  // Known landmark mapping for common Indian metro coordinates
  const landmarks = [
    { lat: 28.6139, lng: 77.2090, city: 'New Delhi', area: 'Connaught Place', state: 'Delhi' },
    { lat: 19.0760, lng: 72.8777, city: 'Mumbai', area: 'Mumbai Central', state: 'Maharashtra' },
    { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', area: 'MG Road', state: 'Karnataka' },
    { lat: 13.0827, lng: 80.2707, city: 'Chennai', area: 'T. Nagar', state: 'Tamil Nadu' },
    { lat: 22.5726, lng: 88.3639, city: 'Kolkata', area: 'Park Street', state: 'West Bengal' },
    { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', area: 'Banjara Hills', state: 'Telangana' },
    { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', area: 'Navrangpura', state: 'Gujarat' },
    { lat: 26.9124, lng: 75.7873, city: 'Jaipur', area: 'MI Road', state: 'Rajasthan' },
  ];

  // Find closest landmark
  let closest = null;
  let minDist = Infinity;
  for (const lm of landmarks) {
    const dist = Math.abs(lm.lat - lat) + Math.abs(lm.lng - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = lm;
    }
  }

  if (closest && minDist < 2) {
    return {
      street: `Near ${closest.area}`,
      area: closest.area,
      city: closest.city,
      state: closest.state,
      pincode: '',
      formattedAddress: `${closest.area}, ${closest.city}, ${closest.state}`,
    };
  }

  return {
    street: '',
    area: '',
    city: 'Unknown',
    state: '',
    pincode: '',
    formattedAddress: `Location: ${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`,
  };
}

module.exports = { reverseGeocode, buildFallbackAddress };
