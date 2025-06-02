export const PASSWORD_MESSAGES = {
  REQUIREMENTS: {
    MIN_LENGTH: 8,
    RULES: [
      'At least 8 characters long',
      'At least one uppercase letter',
      'At least one lowercase letter',
      'At least one number',
      'At least one special character (!@#$%^&*(),.?":{}|<>)',
    ],
    SUMMARY:
      'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
  },
  ERRORS: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: (length: number) => `Password must be at least ${length} characters long`,
    UPPERCASE: 'Password must contain at least one uppercase letter',
    LOWERCASE: 'Password must contain at least one lowercase letter',
    NUMBER: 'Password must contain at least one number',
    SPECIAL_CHAR: 'Password must contain at least one special character',
    MATCH: 'Passwords do not match',
    CURRENT_INCORRECT: 'Current password is incorrect',
    SAME_AS_OLD: 'New password must be different from current password',
  },
};

export const SESSION_MESSAGES = {
  ERRORS: {
    INVALID: 'Session invalidated',
  },
} as const;
