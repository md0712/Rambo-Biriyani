import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import {
  SEED_PRODUCTS,
  SEED_ORDERS,
  SEED_CATEGORIES,
  SEED_USERS,
  SEED_NOTIFICATIONS,
} from '../utils/constants';

/**
 * Seeds the real Firestore database with initial Rambo Biriyani datasets
 * if the collections are currently empty.
 */
export async function seedInitialFirestoreData(force = false) {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty && !force) {
      console.log('[Firestore Seeder] Products collection already initialized.');
      return false;
    }

    console.log('[Firestore Seeder] Starting initial database seeding to Firestore...');

    // 1. Seed Categories
    for (const cat of SEED_CATEGORIES) {
      const catId = typeof cat === 'string' ? cat.toLowerCase().replace(/\s+/g, '-') : cat.id;
      const catData = typeof cat === 'string' ? { name: cat, description: `${cat} category` } : cat;
      await setDoc(doc(db, 'categories', catId), {
        ...catData,
        createdAt: serverTimestamp(),
      });
    }

    // 2. Seed Products
    for (const prod of SEED_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), {
        ...prod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Seed Orders
    for (const ord of SEED_ORDERS) {
      await setDoc(doc(db, 'orders', ord.id), {
        ...ord,
        createdAt: serverTimestamp(),
      });
    }

    // 4. Seed Users
    for (const usr of SEED_USERS) {
      await setDoc(doc(db, 'users', usr.id), {
        ...usr,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // 5. Seed Notifications
    for (const notif of SEED_NOTIFICATIONS) {
      await setDoc(doc(db, 'notifications', notif.id), {
        ...notif,
        createdAt: serverTimestamp(),
      });
    }

    // 6. Seed Outlet Settings
    await setDoc(doc(db, 'settings', 'outlet'), {
      storeName: 'Rambo Biriyani',
      supportEmail: 'support@rambobiriyani.com',
      supportPhone: '+91 98765 43210',
      address: 'Shop 12, Food Warrior Avenue, Anna Nagar, Chennai, Tamil Nadu 600040',
      openingHours: '11:00 AM - 11:30 PM (Daily)',
      currency: '₹ (INR)',
      freeDeliveryThreshold: 499,
      lowStockThreshold: 15,
      orderSoundAlerts: true,
      whatsappAutoNotify: true,
      apiKey: 'rmb_live_948f21e09c8491823abf89',
      updatedAt: serverTimestamp(),
    });

    console.log('[Firestore Seeder] Completed successfully! All collections created in Firestore.');
    return true;
  } catch (error) {
    console.error('[Firestore Seeder Error]', error);
    throw error;
  }
}

export default seedInitialFirestoreData;
