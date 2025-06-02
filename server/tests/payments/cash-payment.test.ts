import { test, expect } from '../setup/test-setup';
import { UserRole, MembershipType } from '../../../shared/constants/user';
import { PaymentTransactionTypes } from '../../../shared/constants/payment';
import { SubscriptionInterval } from '../../../shared/constants/subscription';
import MembershipPlan from '../../src/models/MembershipPlan.model';
import User from '../../src/models/User.model';
import mongoose from 'mongoose';

test.describe('Cash Payment Transaction', () => {
  let authToken: string;
  let membershipPlanId: string;
  let memberId: string;

  test.beforeEach(async ({ request, testContext }) => {
    await testContext.updateUserRole(UserRole.ADMIN);

    const loginResponse = await request.post('/api/v1/auth/login', {
      data: testContext.preRegisteredUser,
    });
    const loginData = await loginResponse.json();
    authToken = loginData.accessToken;

    const adminUser = await User.findOne({ email: testContext.preRegisteredUser.email });
    if (!adminUser) throw new Error('Admin user not found');

    const membershipPlan = await MembershipPlan.create({
      gym: adminUser.gym,
      name: 'Test Plan',
      description: 'Test Plan Description',
      category: MembershipType.BASIC,
      itemType: PaymentTransactionTypes.MEMBERSHIP_PLAN,
      pricing: {
        amount: 100,
        currency: 'USD',
        interval: SubscriptionInterval.MONTH,
        intervalCount: 1,
        tax: {
          enabled: true,
          rate: 0.1, // 10% tax
        },
      },
      features: ['Feature 1', 'Feature 2'],
      trial: {
        enabled: false,
        days: 0,
      },
      contractLength: 0,
      maxMembers: null,
      isActive: true,
      paymentMethodSettings: {
        cash: {
          enabled: true,
          instructions: 'Pay at the front desk',
        },
      },
      createdBy: adminUser._id,
    });
    membershipPlanId = membershipPlan._id.toString();

    const member = await User.create({
      firstName: 'Test',
      lastName: 'Member',
      email: `test-member-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      role: UserRole.MEMBER,
      isEmailVerified: true,
      gym: adminUser.gym,
    });
    memberId = member._id.toString();
  });

  test('should successfully create a cash payment transaction', async ({ request }) => {
    const paymentData = {
      purchasedItemId: membershipPlanId,
      purchasedItemType: PaymentTransactionTypes.MEMBERSHIP_PLAN,
      paymentBy: memberId,
      notes: 'Test cash payment',
    };

    const response = await request.post('/api/v1/payment/cash/', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: paymentData,
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data).toBeDefined();
    expect(body.data.notes).toBe(paymentData.notes);
    expect(body.data.purchasedItem.toString()).toBe(paymentData.purchasedItemId);
    expect(body.data.paymentBy.toString()).toBe(paymentData.paymentBy);
  });

  test('should fail when required fields are missing', async ({ request }) => {
    const invalidPaymentData = {
      paymentBy: memberId,
      notes: 'Test cash payment',
    };

    const response = await request.post('/api/v1/payment/cash/', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: invalidPaymentData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBeFalsy();
  });

  test('should fail without authentication', async ({ request }) => {
    const paymentData = {
      purchasedItemId: membershipPlanId,
      purchasedItemType: PaymentTransactionTypes.MEMBERSHIP_PLAN,
      paymentBy: memberId,
      notes: 'Test cash payment',
    };

    const response = await request.post('/api/v1/payment/cash/', {
      headers: {
        Authorization: '',
        Cookie: '',
      },
      data: paymentData,
    });

    expect(response.status()).toBe(401);
  });

  test('should fail with non-admin user', async ({ request, testContext }) => {
    // Update user to MEMBER role
    await testContext.updateUserRole(UserRole.MEMBER);

    // Login again to get new token with updated role
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: testContext.preRegisteredUser,
    });
    const loginData = await loginResponse.json();
    const memberToken = loginData.accessToken;

    const paymentData = {
      purchasedItemId: membershipPlanId,
      purchasedItemType: PaymentTransactionTypes.MEMBERSHIP_PLAN,
      paymentBy: memberId,
      notes: 'Test cash payment',
    };

    const response = await request.post('/api/v1/payment/cash/', {
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
      data: paymentData,
    });

    expect(response.status()).toBe(403);
  });
});
