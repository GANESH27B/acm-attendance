# Email Domain Validation

## Overview

This document outlines the email domain validation rules implemented in the Smart Attendance Platform.

## Email Domain Rules

### User Accounts

- Regular user accounts (students) **must** use email addresses ending with `@klu.ac.in`
- Registration is restricted to the `@klu.ac.in` domain only
- Any attempt to register with a non-`@klu.ac.in` email will be rejected with an error message

### Admin Accounts

- Admin accounts can use either `@klu.ac.in` or `@gmail.com` domains
- The following admin email addresses are pre-configured in the system:
  - `admin@smartattend.com`
  - `superadmin@gmail.com`
  - `admin1@klu.ac.in`
  - `admin2@klu.ac.in`
  - `admin3@klu.ac.in`
  - `admin4@klu.ac.in`
  - `admin@gmail.com`
- Admin accounts cannot be created through the regular registration process
- Admin accounts are created through the admin account setup script

## Implementation Details

### Login Validation

The login validation process checks if the email is either:
1. One of the pre-configured admin emails, or
2. An email ending with `@klu.ac.in`

If neither condition is met, the system returns an "Invalid email domain" error.

### Registration Validation

The registration form includes client-side validation that checks if the email ends with `@klu.ac.in`. If not, it displays an error message and prevents form submission.

### Password Reset Validation

The password reset functionality also validates email domains using the same rules as the login process.

## Security Considerations

- Domain validation helps prevent unauthorized access attempts
- Admin accounts with non-`@klu.ac.in` domains should be limited and carefully monitored
- Regular audits of admin accounts are recommended

## Files Implementing Email Validation

1. `app/api/auth/login/route.ts` - Backend validation for login
2. `app/api/auth/forgot-password/route.ts` - Backend validation for password reset
3. `app/page.tsx` - Frontend validation for registration
4. `scripts/add-admin-accounts.ts` - Script for adding admin accounts

## Support

If you encounter any issues with email validation or need to add additional admin domains, please contact the system administrator.