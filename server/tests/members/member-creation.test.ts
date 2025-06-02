import { test, expect } from '../setup/test-setup';
import { UserRole } from '../../../shared/constants/user';

test.describe('Member Creation API', () => {
  let authToken: string;

  test.beforeEach(async ({ request, testContext }) => {
    // Update existing user to OWNER role
    await testContext.updateUserRole(UserRole.OWNER);

    // Login to get auth token
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: {
        email: testContext.preRegisteredUser.email,
        password: testContext.preRegisteredUser.password,
      },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.accessToken;
  });

  test('should successfully create a new member', async ({ request }) => {
    const newMemberData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `member-${Date.now()}@example.com`,
      dateOfBirth: '1990-01-01',
      phoneNumber: '+1234567890',
      role: UserRole.MEMBER,
    };

    const response = await request.post('/api/v1/members', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: newMemberData,
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.message).toBe('Member registration successful.');
    expect(body.user).toMatchObject({
      firstName: newMemberData.firstName,
      lastName: newMemberData.lastName,
      email: newMemberData.email,
    });
  });

  test('should fail when required fields are missing', async ({ request }) => {
    const invalidMemberData = {
      firstName: 'John',
      // Missing required fields
      email: 'test@example.com',
    };

    const response = await request.post('/api/v1/members', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: invalidMemberData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Please provide all required fields');
  });

  test('should require guardian info for members under 18', async ({ request }) => {
    const minorMemberData = {
      firstName: 'Young',
      lastName: 'Member',
      email: `minor-${Date.now()}@example.com`,
      dateOfBirth: '2010-01-01', // Makes member under 18
      phoneNumber: '+1234567890',
      role: UserRole.MEMBER,
      // Missing guardian info
    };

    const response = await request.post('/api/v1/members', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: minorMemberData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Guardian information is required for members under 18');
  });

  test('should not allow duplicate email', async ({ request }) => {
    // First create a member
    const memberData = {
      firstName: 'First',
      lastName: 'Member',
      email: `duplicate-${Date.now()}@example.com`,
      dateOfBirth: '1990-01-01',
      phoneNumber: '+1234567890',
      role: UserRole.MEMBER,
    };

    await request.post('/api/v1/members', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: memberData,
    });

    // Try to create another member with same email
    const response = await request.post('/api/v1/members', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: memberData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toBe('Email already registered');
  });

  test('should successfully create a minor member with guardian info', async ({ request }) => {
    const minorMemberData = {
      firstName: 'Young',
      lastName: 'Member',
      email: `minor-${Date.now()}@example.com`,
      dateOfBirth: '2010-01-01',
      phoneNumber: '+1234567890',
      role: UserRole.MEMBER,
      guardian: {
        firstName: 'Parent',
        lastName: 'Guardian',
        email: 'parent@example.com',
        phoneNumber: '+1987654321',
        relationship: 'PARENT',
      },
    };

    const response = await request.post('/api/v1/members', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: minorMemberData,
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.message).toBe('Member registration successful.');
  });
});
