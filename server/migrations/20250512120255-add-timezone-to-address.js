import NodeGeocoder from 'node-geocoder';
import tzlookup from 'tz-lookup';
import moment from 'moment-timezone';

// Initialize geocoder
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  formatter: null,
});

// Timezone determination function
async function determineTimezone(location) {
  try {
    if (!location.country) {
      return 'UTC';
    }

    // Try city + region if both are available
    if (location.city && location.region) {
      const address = `${location.city}, ${location.region}, ${location.country}`;
      const results = await geocoder.geocode({
        address,
        country: location.country,
      });

      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        if (latitude && longitude) {
          return tzlookup(latitude, longitude);
        }
      }
    }

    // Try city only
    if (location.city) {
      const address = `${location.city}, ${location.country}`;
      const results = await geocoder.geocode({
        address,
        country: location.country,
      });

      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        if (latitude && longitude) {
          return tzlookup(latitude, longitude);
        }
      }
    }

    // Fallback to country's default timezone
    const zonesForCountry = moment.tz.zonesForCountry(location.country);
    if (zonesForCountry && zonesForCountry.length > 0) {
      return zonesForCountry[0];
    }

    return 'UTC';
  } catch (error) {
    console.error('Error determining timezone:', error);
    return 'UTC';
  }
}

export async function up(db) {
  // 1. First add the field with default UTC
  await db.collection('gyms').updateMany(
    {},
    {
      $set: {
        'address.timezone': 'UTC',
      },
    }
  );

  // 2. Get all gyms with address data
  const gyms = await db.collection('gyms').find({}).toArray();

  // 3. Update each gym with calculated timezone
  for (const gym of gyms) {
    if (gym.address) {
      try {
        const timezone = await determineTimezone({
          city: gym.address.city,
          country: gym.address.country,
          region: gym.address.region,
        });

        await db.collection('gyms').updateOne(
          { _id: gym._id },
          {
            $set: {
              'address.timezone': timezone,
            },
          }
        );
      } catch (error) {
        console.error(`Failed to determine timezone for gym ${gym._id}:`, error);
      }
    }
  }
}

export async function down(db) {
  await db.collection('gyms').updateMany(
    {},
    {
      $unset: {
        'address.timezone': '',
      },
    }
  );
}
