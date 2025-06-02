import express from 'express';
import memberRoutes from '@/routes/v1/member.routes.js';
import authRoutes from '@/routes/v1/auth.routes.js';
import gymRoutes from '@/routes/v1/gym.routes.js';
import profileRoutes from '@/routes/v1/profile.routes.js';
import registrationLinks from '@/routes/v1/registration.links.routes.js';
import membershipPlanRoutes from '@/routes/v1/membership.plan.routes.js';
import paymentProcessingRoutes from '@/routes/v1/payment.processing.routes.js';
import paymentTransactionRoutes from '@/routes/v1/payment.transaction.routes.js';
import healthRoutes from '@/routes/v1/health.routes.js';

const v1Router = express.Router();

// Routes
v1Router.use('/auth', authRoutes);
v1Router.use('/members', memberRoutes);
v1Router.use('/gyms', gymRoutes);
v1Router.use('/profile', profileRoutes);
v1Router.use('/registration-links', registrationLinks);
v1Router.use('/membership-plans', membershipPlanRoutes);
v1Router.use('/payment', paymentProcessingRoutes);
v1Router.use('/payment-transactions', paymentTransactionRoutes);
v1Router.use('/health', healthRoutes);

export default v1Router;
