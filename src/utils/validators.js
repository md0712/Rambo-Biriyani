/**
 * Validate an email address
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate password requirements
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password) return 'Password is required';
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate generic required text
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate numeric value within bounds
 */
export const validateNumber = (value, fieldName = 'Value', min = 0, max = Infinity) => {
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (num < min) return `${fieldName} cannot be less than ${min}`;
  if (num > max) return `${fieldName} cannot exceed ${max}`;
  return null;
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required';
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(phone.trim())) {
    return 'Please enter a valid phone number';
  }
  return null;
};

/**
 * Full Login form validation
 */
export const validateLoginForm = (values) => {
  const errors = {};
  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(values.password);
  if (passErr) errors.password = passErr;

  return errors;
};

/**
 * Full Register form validation
 */
export const validateRegisterForm = (values) => {
  const errors = {};
  const nameErr = validateRequired(values.name, 'Full name');
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(values.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(values.password, 6);
  if (passErr) errors.password = passErr;

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!values.terms) {
    errors.terms = 'You must agree to the Terms of Service';
  }

  return errors;
};
