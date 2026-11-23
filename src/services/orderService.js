import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ORDER_STATUS, SEED_ORDERS } from '../utils/constants';

const LOCAL_ORDERS_KEY = 'rambo_orders_local';

/**
 * Read cached orders from local storage
 */
const getLocalOrders = () => {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[orderService] Error reading local orders:', err.message);
  }
  return [];
};

/**
 * Save orders to local storage and broadcast update event
 */
const saveLocalOrders = (orders) => {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('rambo_orders_updated'));
  } catch (err) {
    console.warn('[orderService] Error saving local orders:', err.message);
  }
};

/**
 * Timeout helper to prevent infinite loading when Firestore is offline or uninitialized
 */
const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
};

export const orderService = {
  /**
   * Real-time listener for orders collection (Instant updates in Kitchen & Admin Dashboard)
   */
  subscribeOrders(callback, filters = {}) {
    const emitOrders = (list) => {
      let filtered = [...list];
      if (filters.status && filters.status !== 'All') {
        filtered = filtered.filter((o) => o.status === filters.status);
      }
      callback(filtered);
    };

    // Emit cached orders immediately for zero-delay UI render
    emitOrders(getLocalOrders());

    const handleLocalUpdate = () => {
      emitOrders(getLocalOrders());
    };
    window.addEventListener('rambo_orders_updated', handleLocalUpdate);

    let unsubscribe = () => {};
    try {
      const ordersRef = collection(db, 'orders');
      unsubscribe = onSnapshot(
        ordersRef,
        (snapshot) => {
          if (!snapshot.empty) {
            let firestoreOrders = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));

            // Merge local and firestore orders
            const local = getLocalOrders();
            const map = new Map();
            local.forEach((o) => map.set(o.id, o));
            firestoreOrders.forEach((o) => map.set(o.id, { ...map.get(o.id), ...o }));
            const merged = Array.from(map.values());

            merged.sort((a, b) => {
              const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.date || 0).getTime();
              const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.date || 0).getTime();
              return timeB - timeA;
            });

            saveLocalOrders(merged);
            emitOrders(merged);
          }
        },
        (error) => {
          console.warn('[Firestore Orders Subscription Notice] Using local orders:', error.message);
          emitOrders(getLocalOrders());
        }
      );
    } catch (err) {
      emitOrders(getLocalOrders());
    }

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('rambo_orders_updated', handleLocalUpdate);
    };
  },

  /**
   * Fetch all orders from Firestore & LocalStorage (fast with timeout safeguard)
   */
  async getAllOrders(filters = {}) {
    let orders = getLocalOrders();

    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await withTimeout(getDocs(ordersRef), 2000);

      if (!snapshot.empty) {
        let firestoreOrders = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        const map = new Map();
        orders.forEach((o) => map.set(o.id, o));
        firestoreOrders.forEach((o) => map.set(o.id, { ...map.get(o.id), ...o }));
        orders = Array.from(map.values());
        saveLocalOrders(orders);
      }
    } catch (error) {
      console.warn('[Firestore getAllOrders Notice] Returning local orders:', error.message);
    }

    // Sort descending by time
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.date || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.date || 0).getTime();
      return timeB - timeA;
    });

    if (filters.status && filters.status !== 'All') {
      orders = orders.filter((o) => o.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          (o.id || '').toLowerCase().includes(q) ||
          (o.customer || '').toLowerCase().includes(q) ||
          (o.customerPhone || '').toLowerCase().includes(q) ||
          (o.customerEmail || '').toLowerCase().includes(q)
      );
    }

    return orders;
  },

  /**
   * Get an order by ID (with local cache fallback)
   */
  async getOrderById(id) {
    const localOrders = getLocalOrders();
    const local = localOrders.find((o) => o.id === id);

    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await withTimeout(getDoc(docRef), 2000);

      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() };
        const updated = localOrders.map((o) => (o.id === id ? { ...o, ...orderData } : o));
        saveLocalOrders(updated);
        return orderData;
      }
    } catch (error) {
      console.warn(`[Firestore getOrderById Notice] Returning cached order for ${id}:`, error.message);
    }

    if (local) return local;
    const fallback = SEED_ORDERS.find((o) => o.id === id);
    if (fallback) return fallback;
    throw new Error(`Order ${id} not found`);
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id, newStatus) {
    const localOrders = getLocalOrders();
    const updated = localOrders.map((o) =>
      o.id === id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
    );
    saveLocalOrders(updated);

    try {
      const docRef = doc(db, 'orders', id);
      await withTimeout(
        updateDoc(docRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        }),
        2500
      );
    } catch (error) {
      console.warn(`[Firestore updateOrderStatus Notice] Updated locally; cloud sync pending:`, error.message);
    }

    return { id, status: newStatus };
  },

  /**
   * Create a new order with instant response (<100ms) and background sync
   */
  async createOrder(data) {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const items = data.items || [];
    const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const newOrder = {
      id: orderId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: data.status || ORDER_STATUS.PENDING || 'Preparing in Dum',
      itemsCount,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Instantly save in localStorage for ZERO lag UI response
    const localOrders = getLocalOrders();
    saveLocalOrders([newOrder, ...localOrders.filter((o) => o.id !== orderId)]);

    // 2. Perform Firestore persistence & stock deduction safely in the background
    (async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        await withTimeout(
          setDoc(docRef, {
            ...newOrder,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
          3000
        );

        // Deduct portion counts from products
        for (const item of items) {
          if (item.id) {
            try {
              const productRef = doc(db, 'products', item.id);
              const productSnap = await withTimeout(getDoc(productRef), 2000);
              if (productSnap.exists()) {
                const currentStock = productSnap.data().stock || 0;
                const newStock = Math.max(0, currentStock - (item.quantity || 1));
                await withTimeout(
                  updateDoc(productRef, {
                    stock: newStock,
                    status: newStock <= 0 ? 'Sold Out' : newStock <= 15 ? 'Low Stock' : 'In Stock',
                    updatedAt: serverTimestamp(),
                  }),
                  2000
                );
              }
            } catch (e) {
              console.warn(`[Firestore Stock Reduction] Could not update stock for ${item.id}:`, e.message);
            }
          }
        }

        // Notification creation for kitchen
        try {
          const notifDocRef = doc(collection(db, 'notifications'));
          await withTimeout(
            setDoc(notifDocRef, {
              id: notifDocRef.id,
              title: `New Dum Order #${orderId}`,
              desc: `${data.customer || 'Customer'} placed an order worth ₹${data.total || 0}.`,
              type: 'order',
              read: false,
              orderId: orderId,
              createdAt: serverTimestamp(),
            }),
            2000
          );
        } catch (err) {
          console.warn('[Firestore Notification] Notification creation warning:', err.message);
        }
      } catch (error) {
        console.warn('[Firestore createOrder Notice] Order saved locally; cloud sync pending:', error.message);
      }
    })();

    return newOrder;
  },

  /**
   * Retrieve order history by registered mobile phone number
   */
  async getOrdersByPhone(phone) {
    const cleanTargetPhone = (phone || '').replace(/\D/g, '');
    let matchingOrders = getLocalOrders().filter((ord) => {
      if (!ord.customerPhone) return false;
      const cleanPhone = ord.customerPhone.replace(/\D/g, '');
      return cleanPhone.includes(cleanTargetPhone) || cleanTargetPhone.includes(cleanPhone);
    });

    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await withTimeout(getDocs(ordersRef), 2000);
      if (!snapshot.empty) {
        const firestoreOrders = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((ord) => {
            if (!ord.customerPhone) return false;
            const cleanPhone = ord.customerPhone.replace(/\D/g, '');
            return cleanPhone.includes(cleanTargetPhone) || cleanTargetPhone.includes(cleanPhone);
          });
        const map = new Map();
        matchingOrders.forEach((o) => map.set(o.id, o));
        firestoreOrders.forEach((o) => map.set(o.id, { ...map.get(o.id), ...o }));
        matchingOrders = Array.from(map.values());
      }
    } catch (error) {
      console.warn(`[Firestore getOrdersByPhone Notice] Returning cached orders:`, error.message);
    }

    matchingOrders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.date || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.date || 0).getTime();
      return timeB - timeA;
    });

    return matchingOrders;
  },

  /**
   * Retrieve order history by authenticated user ID
   */
  async getOrdersByUserId(uid) {
    let userOrders = getLocalOrders().filter((ord) => ord.userId === uid);

    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await withTimeout(getDocs(ordersRef), 2000);
      if (!snapshot.empty) {
        const firestoreOrders = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter((ord) => ord.userId === uid);
        const map = new Map();
        userOrders.forEach((o) => map.set(o.id, o));
        firestoreOrders.forEach((o) => map.set(o.id, { ...map.get(o.id), ...o }));
        userOrders = Array.from(map.values());
      }
    } catch (error) {
      console.warn(`[Firestore getOrdersByUserId Notice] Returning cached orders:`, error.message);
    }

    userOrders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.date || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.date || 0).getTime();
      return timeB - timeA;
    });

    return userOrders;
  },

  /**
   * Calculate live Kitchen Dashboard telemetry statistics
   */
  async getDashboardStats() {
    try {
      const orders = await this.getAllOrders();

      const totalRevenue = orders
        .filter((o) => o.status !== ORDER_STATUS.CANCELLED)
        .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

      const pendingOrders = orders.filter(
        (o) =>
          o.status === ORDER_STATUS.PENDING ||
          o.status === 'Preparing in Dum' ||
          o.status === 'Order Placed' ||
          o.status === ORDER_STATUS.PROCESSING
      ).length;

      const completedOrders = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;

      return {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalInventory: 0,
        activeRiders: 0,
      };
    } catch (error) {
      console.warn('[Firestore getDashboardStats Notice]', error.message);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalInventory: 0,
        activeRiders: 0,
      };
    }
  },
};

export default orderService;
