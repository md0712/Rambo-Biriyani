import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SEED_PRODUCTS, SEED_CATEGORIES } from '../utils/constants';

// Helper to prevent any Firestore call from hanging indefinitely
const withTimeout = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore request timed out')), ms)
    ),
  ]);
};

// Local storage caching for zero-delay operations
const getLocalProducts = () => {
  try {
    const raw = localStorage.getItem('rambo_products');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalProducts = (products) => {
  try {
    localStorage.setItem('rambo_products', JSON.stringify(products));
    window.dispatchEvent(new Event('rambo_products_updated'));
  } catch (e) {
    console.warn('[LocalStorage] Products save warning:', e);
  }
};

// Local storage caching for categories
const getLocalCategories = () => {
  try {
    const raw = localStorage.getItem('rambo_categories');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalCategories = (categories) => {
  try {
    localStorage.setItem('rambo_categories', JSON.stringify(categories));
    window.dispatchEvent(new Event('rambo_categories_updated'));
  } catch (e) {
    console.warn('[LocalStorage] Categories save warning:', e);
  }
};

export const productService = {
  /**
   * Real-time listener for products collection with immediate local cache response
   */
  subscribeProducts(callback) {
    // 1. Immediately provide cached products so UI is instantly loaded
    const initial = getLocalProducts();
    callback(initial);

    try {
      const productsRef = collection(db, 'products');
      const unsubscribe = onSnapshot(
        productsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const products = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));
            saveLocalProducts(products);
            callback(products);
          } else {
            callback(getLocalProducts());
          }
        },
        (error) => {
          console.warn('[Firestore Products Subscription Notice] Using local cache:', error.message);
          callback(getLocalProducts());
        }
      );

      // Listen to local updates when running offline / before Firestore creation
      const handleLocalUpdate = () => {
        callback(getLocalProducts());
      };
      window.addEventListener('rambo_products_updated', handleLocalUpdate);

      return () => {
        if (unsubscribe) unsubscribe();
        window.removeEventListener('rambo_products_updated', handleLocalUpdate);
      };
    } catch (err) {
      callback(getLocalProducts());
      return () => {};
    }
  },

  /**
   * Fetch all products from Firestore with optional filtering (with timeout safeguard)
   */
  async getAllProducts(filters = {}) {
    let products = getLocalProducts();

    try {
      const productsRef = collection(db, 'products');
      const snapshot = await withTimeout(getDocs(productsRef), 2500);

      if (!snapshot.empty) {
        products = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        saveLocalProducts(products);
      }
    } catch (error) {
      console.warn('[Firestore getAllProducts Notice] Returning local products:', error.message);
      products = getLocalProducts();
    }

    // In-memory / client-side filtering for search & categories
    if (filters.category && filters.category !== 'All') {
      products = products.filter(
        (p) => (p.category || '').toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q)
      );
    }

    if (filters.vegOnly) {
      products = products.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return (
          cat === 'desserts' ||
          cat === 'beverages' ||
          name.includes('veg') ||
          name.includes('paneer') ||
          name.includes('gobi') ||
          name.includes('kushka')
        );
      });
    }

    return products;
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    const local = getLocalProducts().find((p) => p.id === id);
    if (local) return local;

    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await withTimeout(getDoc(docRef), 2500);

      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.warn(`[Firestore getProductById Notice] Item fallback for ${id}:`, error.message);
      if (local) return local;
      throw error;
    }
  },

  /**
   * Create a new product in Firestore & LocalStorage (instant response)
   */
  async createProduct(productData) {
    const generatedId = `prd-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const productsRef = collection(db, 'products');
    const docRef = doc(productsRef, generatedId);

    const payload = {
      ...productData,
      id: generatedId,
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice) || 0,
      stock: Number(productData.stock) || 0,
      rating: 4.8,
      reviewsCount: 1,
      status: Number(productData.stock) <= 0 ? 'Sold Out' : Number(productData.stock) <= 15 ? 'Low Stock' : 'In Stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately save into local storage for zero-lag UI feedback
    const existing = getLocalProducts();
    const updated = [payload, ...existing.filter((p) => p.id !== payload.id)];
    saveLocalProducts(updated);

    // 2. Persist to Firestore in the background or within safe timeout
    try {
      await withTimeout(
        setDoc(docRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        3000
      );
    } catch (error) {
      console.warn('[Firestore createProduct Notice] Saved locally; cloud sync pending:', error.message);
    }

    return payload;
  },

  /**
   * Update an existing product in Firestore & LocalStorage
   */
  async updateProduct(id, productData) {
    const existing = getLocalProducts();
    const targetIndex = existing.findIndex((p) => p.id === id);

    const updates = {
      ...productData,
      updatedAt: new Date().toISOString(),
    };

    if (productData.price !== undefined) updates.price = Number(productData.price);
    if (productData.stock !== undefined) {
      updates.stock = Number(productData.stock);
      updates.status = updates.stock <= 0 ? 'Sold Out' : updates.stock <= 15 ? 'Low Stock' : 'In Stock';
    }

    if (targetIndex >= 0) {
      existing[targetIndex] = { ...existing[targetIndex], ...updates };
      saveLocalProducts([...existing]);
    }

    try {
      const docRef = doc(db, 'products', id);
      await withTimeout(
        updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        }),
        3000
      );
    } catch (error) {
      console.warn(`[Firestore updateProduct ${id} Notice] Saved locally:`, error.message);
    }

    return { id, ...updates };
  },

  /**
   * Delete a product from Firestore & LocalStorage
   */
  async deleteProduct(id) {
    const existing = getLocalProducts();
    const filtered = existing.filter((p) => p.id !== id);
    saveLocalProducts(filtered);

    try {
      const docRef = doc(db, 'products', id);
      await withTimeout(deleteDoc(docRef), 3000);
    } catch (error) {
      console.warn(`[Firestore deleteProduct ${id} Notice] Removed locally:`, error.message);
    }

    return true;
  },

  /**
   * Fetch all categories
   */
  async getCategories() {
    let local = getLocalCategories();
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await withTimeout(getDocs(categoriesRef), 2500);

      if (!snapshot.empty) {
        const cloudCats = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        saveLocalCategories(cloudCats);
        return cloudCats;
      }
      return local;
    } catch (error) {
      console.warn('[Firestore getCategories Notice] Returning local categories:', error.message);
      return local;
    }
  },

  /**
   * Create a new category
   */
  async createCategory(catData) {
    const catId = (catData.name || 'category').toLowerCase().trim().replace(/\s+/g, '-');
    const payload = {
      id: catId,
      name: catData.name.trim(),
      description: catData.description || '',
      slug: catId,
      productsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const existing = getLocalCategories();
    const updated = [...existing.filter((c) => c.id !== catId), payload];
    saveLocalCategories(updated);

    try {
      const docRef = doc(db, 'categories', catId);
      await withTimeout(
        setDoc(docRef, {
          ...payload,
          createdAt: serverTimestamp(),
        }),
        3000
      );
    } catch (error) {
      console.warn('[Firestore createCategory Notice] Saved locally:', error.message);
    }

    return payload;
  },

  /**
   * Delete a category
   */
  async deleteCategory(id) {
    const existing = getLocalCategories();
    const filtered = existing.filter((c) => c.id !== id);
    saveLocalCategories(filtered);

    try {
      await withTimeout(deleteDoc(doc(db, 'categories', id)), 3000);
    } catch (error) {
      console.warn(`[Firestore deleteCategory ${id} Notice] Removed locally:`, error.message);
    }

    return true;
  },
};

export default productService;
