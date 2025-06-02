import { test, expect } from '../setup/test-setup';

test.describe('Authentication - Logout', () => {
  test('should successfully logout authenticated user', async ({ request, testContext }) => {
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: testContext.preRegisteredUser,
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginBody = await loginResponse.json();
    expect(loginBody.accessToken).toBeDefined();

    const logoutResponse = await request.delete('/api/v1/auth/logout', {
      headers: {
        Authorization: `Bearer ${loginBody.accessToken}`,
      },
    });

    expect(logoutResponse.ok()).toBeTruthy();

    const protectedResponse = await request.get('/api/v1/profile', {
      headers: {
        Authorization: `Bearer ${loginBody.accessToken}`,
      },
    });

    expect(protectedResponse.status()).toBe(401);
  });

  test('should fail to logout without authentication', async ({ request }) => {
    const logoutResponse = await request.delete('/api/v1/auth/logout');
    expect(logoutResponse.status()).toBe(401);
  });
});
