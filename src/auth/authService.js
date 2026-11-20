import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { USER_ROLES, SEED_USERS } from '../utils/constants';

const createLocalFallbackUser = (email, name = null, role = null) => {
  const isAdmin = email.toLowerCase() === 'admin@rambo.com';
  return {
    id: isAdmin ? 'demo-admin-id' : `user-${Date.now()}`,
    uid: isAdmin ? 'demo-admin-id' : `user-${Date.now()}`,
    name: name || (isAdmin ? 'Alexander Stone' : (email.split('@')[0] || 'Food Warrior')),
    email: email,
    role: role || (isAdmin ? USER_ROLES.ADMIN : USER_ROLES.CUSTOMER),
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    avatar: isAdmin
      ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    phone: '+91 98765 00123',
    isOfflineDemo: true,
  };
};

export const authService = {
  /**
   * Real Firebase Authentication Sign-In with Offline Demo Fallback
   */
  async login(email, password) {
    // If Firebase API Key is not yet configured, use seamless local session
    if (!isFirebaseConfigured()) {
      console.warn('[Firebase Auth] VITE_FIREBASE_API_KEY is not configured in .env. Logging in via fallback demo session.');
      const fallbackUser = createLocalFallbackUser(email);
      localStorage.setItem('rambo_fallback_user', JSON.stringify(fallbackUser));
      return { user: fallbackUser, token: 'demo-fallback-token' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // Clear any previous fallback session
      localStorage.removeItem('rambo_fallback_user');

      // Retrieve user profile document from Firestore
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData;
      if (userDocSnap.exists()) {
        profileData = userDocSnap.data();

        if (profileData.status === 'Inactive') {
          await signOut(auth);
          throw new Error('This account has been deactivated. Please contact kitchen support.');
        }

        // Update last login timestamp
        await updateDoc(userDocRef, {
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create user document if it doesn't exist
        const isAdminEmail = email.toLowerCase() === 'admin@rambo.com';
        profileData = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || (isAdminEmail ? 'Alexander Stone' : 'Food Warrior'),
          email: fbUser.email,
          role: isAdminEmail ? USER_ROLES.ADMIN : USER_ROLES.CUSTOMER,
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
          avatar: isAdminEmail
            ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          phone: '+91 98765 00123',
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, profileData);
      }

      const token = await fbUser.getIdToken();
      return { user: { ...profileData, uid: fbUser.uid }, token };
    } catch (error) {
      console.error('[Firebase Auth Login Error]', error);

      // Handle uninitialized Authentication or invalid/missing Firebase API key error gracefully
      const isConfigOrKeyError =
        error.code === 'auth/configuration-not-found' ||
        error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' ||
        error.code === 'auth/invalid-api-key' ||
        (error.message && error.message.toLowerCase().includes('configuration-not-found')) ||
        (error.message && error.message.toLowerCase().includes('api-key-not-valid')) ||
        (error.message && error.message.toLowerCase().includes('api key'));

      if (isConfigOrKeyError) {
        console.warn(
          '[Firebase Auth Notice] Firebase Authentication is not yet activated in your Firebase Console (auth/configuration-not-found). Falling back to seamless local session so you can proceed without interruption.'
        );
        const fallbackUser = createLocalFallbackUser(email);
        localStorage.setItem('rambo_fallback_user', JSON.stringify(fallbackUser));
        return { user: fallbackUser, token: 'demo-fallback-token' };
      }

      // Helpful mapping for Firebase auth errors
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        throw new Error('Invalid email or password.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please reset password or try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error connecting to Firebase. Please check your internet connection.');
      }
      throw error;
    }
  },

  /**
   * Real Firebase Authentication Sign-Up with Offline Fallback
   */
  async register(name, email, password, phone = '+91 98765 00123', role = USER_ROLES.CUSTOMER) {
    if (!isFirebaseConfigured()) {
      console.warn('[Firebase Auth] VITE_FIREBASE_API_KEY is not configured in .env. Registering in fallback session.');
      const fallbackUser = createLocalFallbackUser(email, name, role);
      fallbackUser.phone = phone || '+91 98765 00123';
      localStorage.setItem('rambo_fallback_user', JSON.stringify(fallbackUser));
      return { user: fallbackUser, token: 'demo-fallback-token' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      localStorage.removeItem('rambo_fallback_user');

      // Update auth profile display name
      await updateFirebaseProfile(fbUser, { displayName: name });

      // Save user document into Firestore
      const userDocRef = doc(db, 'users', fbUser.uid);
      const profileData = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: name,
        email: email,
        phone: phone || '+91 98765 00123',
        role: role || USER_ROLES.CUSTOMER,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, profileData);
      const token = await fbUser.getIdToken();

      return { user: profileData, token };
    } catch (error) {
      console.error('[Firebase Auth Register Error]', error);

      const isConfigOrKeyError =
        error.code === 'auth/configuration-not-found' ||
        error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' ||
        error.code === 'auth/invalid-api-key' ||
        (error.message && error.message.toLowerCase().includes('configuration-not-found')) ||
        (error.message && error.message.toLowerCase().includes('api-key-not-valid')) ||
        (error.message && error.message.toLowerCase().includes('api key'));

      if (isConfigOrKeyError) {
        console.warn('[Firebase Auth Register Notice] Firebase Authentication is not yet activated in your Firebase Console. Registering in local session.');
        const fallbackUser = createLocalFallbackUser(email, name, role);
        fallbackUser.phone = phone || '+91 98765 00123';
        localStorage.setItem('rambo_fallback_user', JSON.stringify(fallbackUser));
        return { user: fallbackUser, token: 'demo-fallback-token' };
      }

      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      }
      throw error;
    }
  },

  /**
   * Real Firebase Sign-Out
   */
  async logout() {
    localStorage.removeItem('rambo_fallback_user');
    try {
      await signOut(auth);
    } catch (err) {
      // Ignore if offline
    }
  },

  /**
   * Current Authenticated User & Role Detection
   */
  getCurrentUser() {
    if (auth.currentUser) return auth.currentUser;
    const stored = localStorage.getItem('rambo_fallback_user');
    return stored ? JSON.parse(stored) : null;
  },

  async getToken() {
    if (auth.currentUser) return await auth.currentUser.getIdToken();
    const stored = localStorage.getItem('rambo_fallback_user');
    return stored ? 'demo-fallback-token' : null;
  },
};

export default authService;
