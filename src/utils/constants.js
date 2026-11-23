export const APP_CONFIG = {
  NAME: 'Rambo Biriyani',
  TAGLINE: 'BOLD FLAVOURS. NO MERCY.',
  DESCRIPTION: 'Authentic, aromatic and aggressively delicious biriyani crafted for true food warriors.',
  VERSION: '1.0.0',
  CONTACT_PHONE: '+91 98765 43210',
  WHATSAPP_NUMBER: '919876543210',
  CONTACT_EMAIL: 'orders@rambobiriyani.com',
  ADDRESS: '123, Food Street, Anna Nagar, Chennai - 600040',
  OPENING_HOURS: 'Mon - Sun: 11:00 AM - 11:00 PM',
  CURRENCY: '₹',
  DEFAULT_PAGE_SIZE: 12,
};

export const USER_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CUSTOMER: 'Customer',
};

export const ORDER_STATUS = {
  PENDING: 'Order Placed',
  PROCESSING: 'Cooking on Dum',
  SHIPPED: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PRODUCT_CATEGORIES = [];

export const STORAGE_KEYS = {
  AUTH_USER: 'rambo_auth_user',
  AUTH_TOKEN: 'rambo_auth_token',
  THEME: 'rambo_theme',
  CART: 'rambo_cart',
  PRODUCTS: 'rambo_products',
  ORDERS: 'rambo_orders',
  USERS: 'rambo_users',
  CATEGORIES: 'rambo_categories',
  NOTIFICATIONS: 'rambo_notifications',
};

export const WEBSITE_NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/products' },
  { name: 'Our Story', path: '/about' },
  { name: 'Combos & Catering', path: '/services' },
  { name: 'Contact & Outlets', path: '/contact' },
];

export const ADMIN_NAV_LINKS = [
  { name: 'Kitchen Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { name: 'Live Orders', path: '/admin/orders', icon: 'ShoppingBag' },
  { name: 'Biriyani & Menu', path: '/admin/products', icon: 'Package' },
  { name: 'Categories', path: '/admin/categories', icon: 'FolderTree' },
  { name: 'Staff & Customers', path: '/admin/users', icon: 'Users' },
  { name: 'Sales Reports', path: '/admin/reports', icon: 'BarChart3' },
  { name: 'Kitchen Alerts', path: '/admin/notifications', icon: 'Bell' },
  { name: 'Outlet Settings', path: '/admin/settings', icon: 'Settings' },
];

// Initial Seed Data - Cleared for Clean / Zero State
export const SEED_USERS = [];
export const SEED_PRODUCTS = [];
export const SEED_ORDERS = [];
export const SEED_CATEGORIES = [];
export const SEED_NOTIFICATIONS = [];
