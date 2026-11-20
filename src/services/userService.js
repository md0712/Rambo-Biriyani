import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { seedInitialFirestoreData } from '../firebase/seed';
import { SEED_USERS } from '../utils/constants';

export const userService = {
  /**
   * Fetch all users from Firestore
   */
  async getAllUsers(filters = {}) {
    try {
      const usersRef = collection(db, 'users');
      let snapshot = await getDocs(usersRef);

      if (snapshot.empty) {
        await seedInitialFirestoreData();
        snapshot = await getDocs(usersRef);
      }

      let users = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      if (filters.role && filters.role !== 'All') {
        users = users.filter((u) => u.role === filters.role);
      }

      if (filters.status && filters.status !== 'All') {
        users = users.filter((u) => u.status === filters.status);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        users = users.filter(
          (u) =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.phone || '').toLowerCase().includes(q)
        );
      }

      return users;
    } catch (error) {
      console.warn('[Firestore getAllUsers Notice] Falling back to default staff and users list:', error.message);
      let users = [...SEED_USERS];
      if (filters.role && filters.role !== 'All') {
        users = users.filter((u) => u.role === filters.role);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        users = users.filter((u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
      }
      return users;
    }
  },

  /**
   * Fetch a single user by ID
   */
  async getUserById(id) {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`User ${id} not found in Firestore`);
      }

      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(`[Firestore getUserById ${id} Error]`, error);
      throw error;
    }
  },

  /**
   * Create a new user profile in Firestore
   */
  async createUser(userData) {
    try {
      const docRef = doc(collection(db, 'users'));
      const payload = {
        ...userData,
        id: docRef.id,
        status: userData.status || 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, payload);
      return payload;
    } catch (error) {
      console.error('[Firestore createUser Error]', error);
      throw error;
    }
  },

  /**
   * Update an existing user in Firestore
   */
  async updateUser(id, userData) {
    try {
      const docRef = doc(db, 'users', id);
      const updates = {
        ...userData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updates);
      return { id, ...updates };
    } catch (error) {
      console.error(`[Firestore updateUser ${id} Error]`, error);
      throw error;
    }
  },

  /**
   * Toggle user active/inactive status
   */
  async toggleUserStatus(id) {
    try {
      const user = await this.getUserById(id);
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      return await this.updateUser(id, { status: newStatus });
    } catch (error) {
      console.error(`[Firestore toggleUserStatus ${id} Error]`, error);
      throw error;
    }
  },

  /**
   * Delete a user profile
   */
  async deleteUser(id) {
    try {
      await deleteDoc(doc(db, 'users', id));
      return true;
    } catch (error) {
      console.error(`[Firestore deleteUser ${id} Error]`, error);
      throw error;
    }
  },
};

export default userService;
