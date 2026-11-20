import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { seedInitialFirestoreData } from '../firebase/seed';
import { SEED_PRODUCTS, SEED_CATEGORIES } from '../utils/constants';

export const productService = {
  /**
   * Real-time listener for products collection
   */
  subscribeProducts(callback) {
    const productsRef = collection(db, 'products');
    return onSnapshot(
      productsRef,
      (snapshot) => {
        const products = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        callback(products);
      },
      (error) => {
        console.error('[Firestore Products Subscription Error]', error);
      }
    );
  },

  /**
   * Fetch all products from Firestore with optional filtering
   */
  async getAllProducts(filters = {}) {
    try {
      const productsRef = collection(db, 'products');
      let snapshot = await getDocs(productsRef);

      // If Firestore database is brand new, auto-seed with official Rambo items
      if (snapshot.empty) {
        await seedInitialFirestoreData();
        snapshot = await getDocs(productsRef);
      }

      let products = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // In-memory or client-side filtering for search & categories
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
    } catch (error) {
      console.warn('[Firestore getAllProducts Notice] Falling back to default Rambo menu catalog:', error.message);
      let products = [...SEED_PRODUCTS];
      if (filters.category && filters.category !== 'All') {
        products = products.filter((p) => (p.category || '').toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        products = products.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
      }
      return products;
    }
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const fallback = SEED_PRODUCTS.find((p) => p.id === id);
        if (fallback) return fallback;
        throw new Error('Product not found');
      }

      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.warn(`[Firestore getProductById Notice] Item fallback for ${id}:`, error.message);
      const fallback = SEED_PRODUCTS.find((p) => p.id === id);
      if (fallback) return fallback;
      throw error;
    }
  },

  /**
   * Create a new product in Firestore
   */
  async createProduct(productData) {
    try {
      const productsRef = collection(db, 'products');
      const docRef = doc(productsRef);

      const payload = {
        ...productData,
        id: docRef.id,
        price: Number(productData.price) || 0,
        originalPrice: Number(productData.originalPrice) || 0,
        stock: Number(productData.stock) || 0,
        rating: 4.8,
        reviewsCount: 1,
        status: Number(productData.stock) <= 0 ? 'Sold Out' : Number(productData.stock) <= 15 ? 'Low Stock' : 'In Stock',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, payload);
      return payload;
    } catch (error) {
      console.error('[Firestore createProduct Error]', error);
      throw error;
    }
  },

  /**
   * Update an existing product in Firestore
   */
  async updateProduct(id, productData) {
    try {
      const docRef = doc(db, 'products', id);
      const updates = {
        ...productData,
        updatedAt: serverTimestamp(),
      };

      if (productData.price !== undefined) updates.price = Number(productData.price);
      if (productData.stock !== undefined) {
        updates.stock = Number(productData.stock);
        updates.status = updates.stock <= 0 ? 'Sold Out' : updates.stock <= 15 ? 'Low Stock' : 'In Stock';
      }

      await updateDoc(docRef, updates);
      return { id, ...updates };
    } catch (error) {
      console.error(`[Firestore updateProduct ${id} Error]`, error);
      throw error;
    }
  },

  /**
   * Delete a product from Firestore
   */
  async deleteProduct(id) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`[Firestore deleteProduct ${id} Error]`, error);
      throw error;
    }
  },

  /**
   * Fetch all categories
   */
  async getCategories() {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);

      if (snapshot.empty) {
        await seedInitialFirestoreData();
        const freshSnap = await getDocs(categoriesRef);
        return freshSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (error) {
      console.warn('[Firestore getCategories Notice] Falling back to default categories:', error.message);
      return SEED_CATEGORIES;
    }
  },

  /**
   * Create a new category
   */
  async createCategory(catData) {
    try {
      const catId = (catData.name || 'category').toLowerCase().replace(/\s+/g, '-');
      const docRef = doc(db, 'categories', catId);
      const payload = {
        id: catId,
        name: catData.name,
        description: catData.description || '',
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, payload);
      return payload;
    } catch (error) {
      console.error('[Firestore createCategory Error]', error);
      throw error;
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id) {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return true;
    } catch (error) {
      console.error(`[Firestore deleteCategory ${id} Error]`, error);
      throw error;
    }
  },
};

export default productService;
