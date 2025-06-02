import { Resend } from 'resend';
import config from '@/config/index.js';

let resend: Resend;

const initializeResend = () => {
  if (!resend) {
    resend = new Resend(config.resend.apiKey);
  }
  return resend;
};

export const sendVerificationEmail = async (
  to: string,
  verificationLink: string,
  gymName: string
) => {
  const resendClient = initializeResend();
  try {
    await resendClient.emails.send({
      from: config.resend.from,
      to: to,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to ${gymName}!</h1>
          
          <p>Thank you for signing up! To get started, please verify your email address.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${verificationLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours for security purposes. If you didn't create an account, 
            please ignore this email.
          </p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${verificationLink}
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const resendClient = initializeResend();
  try {
    await resendClient.emails.send({
      from: config.resend.from,
      to: to,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Your Password</h1>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour for security purposes. If you didn't request a password reset, 
            please ignore this email or contact support if you're concerned.
          </p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${resetLink}
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendMemberSetupEmail = async (
  to: string,
  setupLink: string,
  memberName: string,
  gymName: string
) => {
  const resendClient = initializeResend();
  try {
    await resendClient.emails.send({
      from: config.resend.from,
      to: to,
      subject: 'Complete Your Membership Setup',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to ${gymName}!</h1>
          
          <p>Hello ${memberName},</p>
          
          <p>A membership account has been created for you by our staff. To access your account, you'll need to:</p>
          
          <ol>
            <li>Verify your email address</li>
            <li>Create your password</li>
          </ol>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${setupLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Complete Account Setup
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours for security purposes. If you didn't expect this email, 
            please ignore it or contact our staff.
          </p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${setupLink}
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending member setup email:', error);
    throw error;
  }
};
