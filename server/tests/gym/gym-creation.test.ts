import { test, expect } from '../setup/test-setup';
import { MULTI_TIMEZONE_COUNTRIES } from '../../../shared/constants/countries';

test.describe('Gym Creation', () => {
  const createValidGymData = (timestamp: string) => ({
    // Gym details
    gymName: `Test Gym ${timestamp}`,
    city: 'Test City',
    region: 'Test Region',
    country: 'PA', // Panama (non-multi-timezone country)
    // Owner details
    firstName: 'John',
    lastName: 'Doe',
    email: `owner-${timestamp}@example.com`,
    password: 'ValidPass123!',
  });

  test('should successfully create a new gym with all valid data', async ({ request }) => {
    const timestamp = Date.now().toString();
    const gymData = createValidGymData(timestamp);

    const response = await request.post('/api/v1/gyms/register', {
      data: gymData,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('gym');
    expect(body).toHaveProperty('user');

    expect(body.gym).toHaveProperty('id');
    expect(body.gym.name).toBe(gymData.gymName);

    expect(body.user).toHaveProperty('id');
    expect(body.user.email).toBe(gymData.email);
    expect(body.user.role).toBe('OWNER');
  });

  test('should fail when required fields are missing', async ({ request }) => {
    const timestamp = Date.now().toString();
    const incompleteData = {
      gymName: `Test Gym ${timestamp}`,
    };

    const response = await request.post('/api/v1/gyms/register', {
      data: incompleteData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Please provide all required fields');
  });

  test('should fail when country is not supported (multi-timezone)', async ({ request }) => {
    const timestamp = Date.now().toString();
    const gymData = createValidGymData(timestamp);
    gymData.country = MULTI_TIMEZONE_COUNTRIES[0]; // Use first multi-timezone country

    const response = await request.post('/api/v1/gyms/register', {
      data: gymData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Country not supported');
  });

  test('should fail when email is already registered', async ({ request }) => {
    const timestamp = Date.now().toString();
    const gymData = createValidGymData(timestamp);

    // First registration
    await request.post('/api/v1/gyms/register', {
      data: gymData,
    });

    // Second registration with same email
    const response = await request.post('/api/v1/gyms/register', {
      data: gymData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('email already registered');
  });

  test('should fail when gym name is already registered', async ({ request }) => {
    const timestamp = Date.now().toString();
    const firstGymData = createValidGymData(timestamp);

    // First registration
    await request.post('/api/v1/gyms/register', {
      data: firstGymData,
    });

    // Second registration with same gym name but different email
    const secondGymData = {
      ...firstGymData,
      email: `different-${timestamp}@example.com`,
    };

    const response = await request.post('/api/v1/gyms/register', {
      data: secondGymData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Gym name already registered');
  });

  test('should fail when password is invalid', async ({ request }) => {
    const timestamp = Date.now().toString();
    const gymData = createValidGymData(timestamp);
    gymData.password = 'weak';

    const response = await request.post('/api/v1/gyms/register', {
      data: gymData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('Password must');
  });
});
