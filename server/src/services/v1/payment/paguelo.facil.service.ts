import {
  PaymentMethods,
  PaymentStatus,
  PaymentTransactionTypes,
} from '@shared/constants/payment.js';
import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import User from '@/models/User.model.js';
import axios from 'axios';
import { logger, stringToHex } from '@/utils/index.js';
import { PAYMENT_EXPIRATION_MINUTES } from '@shared/constants/payment.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';
import { PAYMENT_TYPE_FOR, MODEL_FOR_PAYMENT_TYPE } from '@/constants/payment.js';
import {
  CreatePagueloFacilPaymentParams,
  CreatePagueloFacilPaymentResponse,
} from '@/types/paguelo.facil.types.js';
import { calculateInvoicing, calculateSubscription } from '@/utils/index.js';
import config from '@/config/index.js';

export const createPagueloFacilPayment = async ({
  purchasedItemId,
  purchasedItemType,
  paymentBy,
}: CreatePagueloFacilPaymentParams): Promise<CreatePagueloFacilPaymentResponse> => {
  const Model = MODEL_FOR_PAYMENT_TYPE[purchasedItemType as keyof typeof MODEL_FOR_PAYMENT_TYPE];
  if (!Model) {
    throw new Error('Invalid item type');
  }

  const purchasedItem = await Model.findById(purchasedItemId);
  if (!purchasedItem) {
    throw new Error('Purchased item not found');
  }

  const paidBy = await User.findById(paymentBy).populate<{
    gym: { address: { timezone: string } };
  }>('gym', 'address.timezone');
  if (!paidBy) {
    throw new Error('User not found');
  }

  if (
    purchasedItemType === PaymentTransactionTypes.MEMBERSHIP_PLAN &&
    paidBy.activeMembershipPlan?.plan
  ) {
    throw new Error(
      'You already have an active membership plan. You can only have one active membership at a time.'
    );
  }

  // Determine payment type based on the model
  const paymentTransactionType =
    PAYMENT_TYPE_FOR[purchasedItemType as keyof typeof PAYMENT_TYPE_FOR];
  if (!paymentTransactionType) {
    throw new Error('Invalid payment type');
  }

  // Access the Paguelo Facil configuration using the correct structure
  const pagueloFacilConfig = purchasedItem.paymentMethodSettings?.[PaymentMethods.PAGUELO_FACIL];

  if (!pagueloFacilConfig?.enabled || !pagueloFacilConfig?.credentials?.cclw) {
    throw new Error('Paguelo Facil is not properly configured for this membership plan');
  }

  const { quantity, unitPrice, subtotal, taxAmount, totalAmount } =
    calculateInvoicing(purchasedItem);
  const { startDate, endDate } = calculateSubscription(purchasedItem, paidBy.gym.address.timezone);

  let payment;
  try {
    // Create the payment transaction
    payment = await PaymentTransaction.create({
      gym: paidBy.gym,
      type: paymentTransactionType,
      purchasedItem: purchasedItemId,
      paymentBy,
      amount: totalAmount,
      currency: purchasedItem.pricing.currency,
      paymentMethod: PaymentMethods.PAGUELO_FACIL,
      receivedBy: null,
      status: PaymentStatus.PENDING,
      ...(purchasedItemType === PaymentTransactionTypes.MEMBERSHIP_PLAN && {
        subscription: {
          isSubscription: true,
          startDate,
          endDate,
          status: SubscriptionStatus.PENDING,
          renewalDate: endDate,
        },
      }),
      invoicing: {
        taxAmount,
        taxRate: purchasedItem.pricing.tax.rate,
        items: [
          {
            description: purchasedItem.name,
            quantity,
            unitPrice,
            amount: subtotal,
            taxable: purchasedItem.pricing.tax.enabled,
          },
        ],
      },
    });

    const baseUrl = config.server.clientUrl;
    const returnUrl = `${baseUrl}/payment/callback?paymentId=${payment.id}`;

    // Custom fields example (optional)
    const customFields = [
      {
        id: payment.id,
        nameOrLabel: 'Payment ID',
        type: 'hidden',
        value: payment.id,
      },
    ];

    // Prepare data for Paguelo Facil
    const data = {
      CCLW: pagueloFacilConfig.credentials.cclw.trim(),
      CMTN: totalAmount.toFixed(2),
      CDSC: purchasedItem.name.substring(0, 150), // Ensure max length 150
      RETURN_URL: stringToHex(returnUrl), // Convert to hex as required
      CARD_TYPE: 'CARD',
      EXPIRES_IN: PAYMENT_EXPIRATION_MINUTES * 60,
      ...(purchasedItem.pricing.tax.enabled && { CTAX: taxAmount.toFixed(2) }),
      PF_CF: stringToHex(JSON.stringify(customFields)), // Optional custom fields in hex
    };

    const requestBody = Object.entries(data)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await axios({
      method: 'POST',
      url: config.pagueloFacil.url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
      },
      data: requestBody,
    });

    // If we get an error response
    if (response.data?.headerStatus?.code !== 200) {
      throw new Error(
        response.data?.headerStatus?.description ||
          response.data?.message ||
          'Unknown error from payment gateway'
      );
    }

    // Check for URL in response
    const paymentUrl = response.data?.data?.url || response.data?.url || response.data;
    if (typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
      return {
        success: true,
        paymentId: payment.id,
        paymentUrl,
      };
    }

    throw new Error('No valid payment URL in response');
  } catch (error) {
    // If payment was created, delete it
    if (payment) {
      await PaymentTransaction.findByIdAndDelete(payment.id);
    }

    logger.error('Paguelo Facil API error:', error);
    if (axios.isAxiosError(error) && error.response) {
      logger.error('Response data:', error.response.data);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to generate payment link');
  }
};
