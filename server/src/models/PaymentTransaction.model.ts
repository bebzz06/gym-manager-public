import mongoose, { Schema } from 'mongoose';
import { IPaymentTransaction, IRefund, IInvoiceItem } from '@/types/payment.transaction.types.js';
import {
  PaymentStatus,
  PaymentMethods,
  PAYMENT_EXPIRATION_MINUTES,
  PaymentTransactionTypes,
  PaymentCurrencies,
} from '@shared/constants/payment.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';
import { formatAmountToCurrency, formatAmountToCentsOfCurrency } from '@shared/utils/index.js';
const refundSchema = new Schema<IRefund>({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  reason: String,
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  metadata: {
    type: Schema.Types.Mixed, //TODO: Replace with proper type when known
    default: {},
  },
});

const invoiceItemSchema = new Schema<IInvoiceItem>({
  description: String,
  quantity: Number,
  unitPrice: Number,
  amount: Number,
  taxable: {
    type: Boolean,
    required: true,
  },
});

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(PaymentTransactionTypes),
      required: true,
    },
    purchasedItem: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'type',
    },
    paymentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      get: (v: number) => formatAmountToCurrency(v),
      set: (v: number) => formatAmountToCentsOfCurrency(v),
    },
    currency: {
      type: String,
      enum: Object.values(PaymentCurrencies),
      required: true,
      default: PaymentCurrencies.USD,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethods),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    invoicing: {
      receiptNumber: {
        type: String,
        unique: true,
      },
      invoiceNumber: {
        type: String,
        unique: true,
      },
      invoiceDate: {
        type: Date,
        default: Date.now,
      },
      taxAmount: {
        type: Number,
        default: 0,
      },
      taxRate: {
        type: Number,
        default: 0,
      },
      items: {
        type: [invoiceItemSchema],
        default: [],
      },
    },
    metadata: {
      type: Schema.Types.Mixed, //TODO: Replace with proper type when known
      default: {},
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: String,
    refunds: { type: [refundSchema], default: [] },
    subscription: {
      isSubscription: {
        type: Boolean,
        required: true,
        default: false,
      },
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
      },
      renewalDate: Date,
      cancelledAt: Date, //TODO - once subscription api from paguelo facil is provided.
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + PAYMENT_EXPIRATION_MINUTES * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
paymentTransactionSchema.index({ gym: 1, createdAt: -1 });
paymentTransactionSchema.index({ purchasedItem: 1, paymentBy: 1 });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ paymentMethod: 1 });
paymentTransactionSchema.index({ 'subscription.endDate': 1, 'subscription.status': 1 });

// Auto-generate invoice and receipt numbers
paymentTransactionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();

    if (!this.invoicing) {
      this.invoicing = {
        invoiceDate: new Date(),
        taxAmount: 0,
        taxRate: 0,
        items: [],
        receiptNumber: '',
        invoiceNumber: '',
      };
    }

    const PaymentTransaction = mongoose.model('PaymentTransaction');
    const lastInvoice = await PaymentTransaction.findOne({
      'invoicing.invoiceNumber': new RegExp(`^INV-${year}-`),
    }).sort({ 'invoicing.invoiceNumber': -1 });

    const invoiceSequence = lastInvoice?.invoicing?.invoiceNumber
      ? parseInt(lastInvoice.invoicing.invoiceNumber.split('-')[2]) + 1
      : 1;

    this.invoicing!.invoiceNumber = `INV-${year}-${invoiceSequence.toString().padStart(4, '0')}`;

    // Generate receipt number
    const lastReceipt = await PaymentTransaction.findOne({
      'invoicing.receiptNumber': new RegExp(`^RCP-${year}-`),
    }).sort({ 'invoicing.receiptNumber': -1 });

    const receiptSequence = lastReceipt
      ? parseInt(lastReceipt.invoicing.receiptNumber.split('-')[2]) + 1
      : 1;

    this.invoicing!.receiptNumber = `RCP-${year}-${receiptSequence.toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);
