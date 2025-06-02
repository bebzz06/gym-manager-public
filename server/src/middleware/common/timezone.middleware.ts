import NodeGeocoder, { Geocoder } from 'node-geocoder';
import tzlookup from 'tz-lookup';
import countries from 'i18n-iso-countries';
import moment from 'moment-timezone';
// issue is definitely with the geocoding part that's giving us wrong coordinates when providing a postal code.
// TODO: we should try to use the google maps api to get the coordinates of the postal code.
//
//for now we will aloow only single timezone countries.

interface LocationInput {
  city: string | null;
  country: string;
  postalCode: string | null;
  region: string | null;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface TimezoneResult {
  timezone: string;
  coordinates?: Coordinates;
  source: 'postal_code' | 'city_region' | 'city' | 'country' | 'fallback';
}

// Initialize geocoder with OpenStreetMap
const geocoder: Geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  formatter: null,
});

// Special regions that need specific handling
const SPECIAL_REGIONS = new Map<string, string>([
  ['HK', 'Asia/Hong_Kong'],
  ['MO', 'Asia/Macau'],
  ['TW', 'Asia/Taipei'],
]);

// Cities known to span multiple timezones
const MULTI_TIMEZONE_CITIES = new Set(['YAKUTSK_RU', 'URUMQI_CN', 'JUNEAU_US']);

/**
 * Main function to determine timezone from location information
 */
export async function determineTimezone(location: LocationInput): Promise<TimezoneResult> {
  try {
    // Validate country code (required)
    if (!location.country || !countries.isValid(location.country)) {
      throw new Error(`Invalid country code: ${location.country}`);
    }

    // Check for special administrative regions first
    if (SPECIAL_REGIONS.has(location.country)) {
      return {
        timezone: SPECIAL_REGIONS.get(location.country)!,
        source: 'country',
      };
    }

    // Try postal code first if available and not null
    if (location.postalCode) {
      try {
        const postalResult = await lookupByPostalCode(location.postalCode, location.country);
        if (postalResult) {
          return {
            ...postalResult,
            source: 'postal_code',
          };
        }
      } catch (error) {
        console.warn(`Postal code lookup failed, falling back to city lookup`, error);
      }
    }

    // Try city + region if both are available and not null
    if (location.city && location.region) {
      try {
        const cityRegionResult = await lookupByCityAndRegion(
          location.city,
          location.region,
          location.country
        );
        if (cityRegionResult) {
          return {
            ...cityRegionResult,
            source: 'city_region',
          };
        }
      } catch (error) {
        console.warn(`City+region lookup failed, falling back to city only`, error);
      }
    }

    // Try city only if available and not null
    if (location.city) {
      try {
        const cityResult = await lookupByCity(location.city, location.country);
        if (cityResult) {
          return {
            ...cityResult,
            source: 'city',
          };
        }
      } catch (error) {
        console.warn(`City lookup failed, falling back to country`, error);
      }
    }

    // Fallback to country-based timezone
    return {
      timezone: getCountryDefaultTimezone(location.country),
      source: 'fallback',
    };
  } catch (error) {
    console.error('Timezone determination error:', error);
    return {
      timezone: 'UTC',
      source: 'fallback',
    };
  }
}

/**
 * Lookup timezone by postal code
 */
async function lookupByPostalCode(
  postalCode: string,
  country: string
): Promise<TimezoneResult | null> {
  const results = await geocoder.geocode({
    zipcode: postalCode,
    country,
  });

  if (results.length === 0) {
    return null;
  }

  const { latitude, longitude } = results[0] ?? {};
  if (!latitude || !longitude) {
    return null;
  }
  return {
    timezone: tzlookup(latitude, longitude),
    coordinates: { latitude, longitude },
    source: 'postal_code',
  };
}

/**
 * Lookup timezone by city and region
 */
async function lookupByCityAndRegion(
  city: string,
  region: string,
  country: string
): Promise<TimezoneResult | null> {
  const address = region ? `${city}, ${region}, ${country}` : `${city}, ${country}`;
  const results = await geocoder.geocode({
    address,
    country,
  });

  if (results.length === 0) {
    return null;
  }

  const { latitude, longitude } = results[0] ?? {};
  if (!latitude || !longitude) {
    return null;
  }
  return {
    timezone: tzlookup(latitude, longitude),
    coordinates: { latitude, longitude },
    source: 'city_region',
  };
}

/**
 * Lookup timezone by city only
 */
async function lookupByCity(city: string, country: string): Promise<TimezoneResult | null> {
  const address = `${city}, ${country}`;
  const results = await geocoder.geocode({
    address,
    country,
  });

  if (results.length === 0) {
    return null;
  }

  // Check if we got multiple results
  if (results.length > 1) {
    console.warn(`Multiple results found for ${city}, using first result`);
  }

  const { latitude, longitude } = results[0] ?? {};
  if (!latitude || !longitude) {
    return null;
  }
  return {
    timezone: tzlookup(latitude, longitude),
    coordinates: { latitude, longitude },
    source: 'city',
  };
}

/**
 * Get default timezone for a country
 */
function getCountryDefaultTimezone(country: string): string {
  try {
    const zonesForCountry = moment.tz.zonesForCountry(country);
    if (!zonesForCountry || zonesForCountry.length === 0) {
      return 'UTC';
    }
    return zonesForCountry[0];
  } catch (error) {
    console.error(`Error getting default timezone for ${country}:`, error);
    return 'UTC';
  }
}

/**
 * Validate a timezone string
 */
export function validateTimezone(timezone: string): boolean {
  return moment.tz.zone(timezone) !== null;
}

/**
 * Check if a location is in a multi-timezone city
 */
export function isMultiTimezoneCity(city: string, country: string): boolean {
  const key = `${city.toUpperCase()}_${country}`;
  return MULTI_TIMEZONE_CITIES.has(key);
}
