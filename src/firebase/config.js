import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCqObyKt6TbYcGhtqG-BwhnkLJT3yVM3Ak',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rambo-biriyani-654c6.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rambo-biriyani-654c6',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rambo-biriyani-654c6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '991920876627',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:991920876627:web:1f78d1c6e36893ae99eaa6',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-HFVCCCTK8X',
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Helper to verify if real Firebase credentials have been configured
export const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;
  return Boolean(
    key &&
    typeof key === 'string' &&
    key.trim().length > 15 &&
    !key.includes('Dummy') &&
    !key.includes('your_') &&
    !key.includes('AIzaSyDemo')
  );
};

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
})();
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Firebase Analytics (Browser only)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((yes) => {
      if (yes) analytics = getAnalytics(app);
    })
    .catch(() => {});
}

// Optional: Connect to local emulators if configured in environment
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.info('[Firebase] Connected to local Firebase Emulators.');
  } catch (err) {
    console.warn('[Firebase] Emulator connection warning:', err.message);
  }
}

export default app;
