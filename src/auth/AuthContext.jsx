import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import authService from './authService';
import { USER_ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const fallback = localStorage.getItem('rambo_fallback_user');
      return fallback ? JSON.parse(fallback) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('rambo_fallback_user') ? 'demo-fallback-token' : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time Firebase Authentication state
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userToken = await fbUser.getIdToken();
          setToken(userToken);
          localStorage.removeItem('rambo_fallback_user');

          // Immediately populate authenticated user to unblock routing in 0ms
          const isAdminEmail = fbUser.email?.toLowerCase() === 'admin@rambo.com';
          const immediateProfile = {
            uid: fbUser.uid,
            id: fbUser.uid,
            name: fbUser.displayName || (isAdminEmail ? 'Alexander Stone' : (fbUser.email?.split('@')[0] || 'Food Warrior')),
            email: fbUser.email,
            role: isAdminEmail ? USER_ROLES.ADMIN : USER_ROLES.CUSTOMER,
            status: 'Active',
            avatar: isAdminEmail
              ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            phone: '+91 98765 00123',
          };

          setUser((prev) => (prev && prev.uid === fbUser.uid ? { ...immediateProfile, ...prev } : immediateProfile));
          setLoading(false);

          // Background listener for any custom profile changes in Firestore
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            unsubscribeFirestore = onSnapshot(
              userDocRef,
              (docSnap) => {
                if (docSnap.exists()) {
                  const profile = docSnap.data();
                  setUser((prev) => ({ ...prev, ...profile, uid: fbUser.uid }));
                }
              },
              (err) => {
                console.warn('[AuthContext] Background Firestore sync notice:', err.message);
              }
            );
          } catch (listenErr) {
            console.warn('[AuthContext] Listener attach notice:', listenErr.message);
          }
        } catch (error) {
          console.error('[AuthContext] Error retrieving Firebase token:', error);
          setLoading(false);
        }
      } else {
        if (unsubscribeFirestore) unsubscribeFirestore();
        try {
          const fallback = localStorage.getItem('rambo_fallback_user');
          if (fallback) {
            setUser(JSON.parse(fallback));
            setToken('demo-fallback-token');
          } else {
            setUser(null);
            setToken(null);
          }
        } catch {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, phone);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('rambo_fallback_user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (updatedFields) => {
    if (!user?.uid && !auth.currentUser?.uid) return;
    try {
      if (user?.isOfflineDemo || !isFirebaseConfigured()) {
        const updated = { ...user, ...updatedFields };
        setUser(updated);
        localStorage.setItem('rambo_fallback_user', JSON.stringify(updated));
        return;
      }
      const uid = user?.uid || auth.currentUser.uid;
      const userDocRef = doc(db, 'users', uid);

      await updateDoc(userDocRef, {
        ...updatedFields,
        updatedAt: serverTimestamp(),
      });

      setUser((prev) => ({ ...prev, ...updatedFields }));
    } catch (err) {
      console.warn('[AuthContext] Profile update offline fallback:', err.message);
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('rambo_fallback_user', JSON.stringify(updated));
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MANAGER);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
