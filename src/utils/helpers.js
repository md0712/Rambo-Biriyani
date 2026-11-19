/**
 * Format a number as currency (e.g. ₹249 or ₹1,249)
 */
export const formatCurrency = (amount, currency = '₹') => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return `${currency}${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
};

/**
 * Format a date string or timestamp
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
};

/**
 * Truncate long text with ellipsis
 */
export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Slugify a string for URL usage
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Generate a random alphanumeric unique ID with prefix
 */
export const generateId = (prefix = 'id') => {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timePart = Date.now().toString(36).substring(4);
  return `${prefix}-${randomPart}${timePart}`;
};

/**
 * Debounce helper for search and input filtering
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Join conditional CSS classes
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
};

/**
 * Create WhatsApp direct ordering link
 */
export const getWhatsAppOrderLink = (phone = '919876543210', message = 'Hi Rambo Biriyani, I would like to place an order!') => {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
