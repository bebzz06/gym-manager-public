import { test, expect } from '../setup/test-setup';

test.describe('Authentication - Login', () => {
  test('should successfully login with valid credentials', async ({ request, testContext }) => {
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: testContext.preRegisteredUser,
    });

    expect(loginResponse.ok()).toBeTruthy();
    const body = await loginResponse.json();
    expect(body.user).toBeDefined();
    expect(body.accessToken).toBeDefined();
  });

  test('should fail login with invalid credentials', async ({ request, testContext }) => {
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: {
        email: testContext.preRegisteredUser.email,
        password: 'wrongpassword',
      },
    });

    expect(loginResponse.status()).toBe(401);
  });

  test('should respect rate limiting', async ({ request, testContext }) => {
    for (let i = 0; i < 6; i++) {
      await request.post('/api/v1/auth/login', {
        data: {
          email: testContext.preRegisteredUser.email,
          password: 'wrongpassword',
        },
      });
    }

    const lastResponse = await request.post('/api/v1/auth/login', {
      data: testContext.preRegisteredUser,
    });

    expect(lastResponse.status()).toBe(429);
  });
});
