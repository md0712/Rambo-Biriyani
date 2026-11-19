import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read .env if present
const envPath = path.join(rootDir, '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        envVars[key] = val;
      }
    }
  });
}

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyApiKeyForConfigVerification',
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || 'rambo-biriyani.firebaseapp.com',
  projectId: envVars.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'rambo-biriyani',
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || 'rambo-biriyani.appspot.com',
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: envVars.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
  measurementId: envVars.VITE_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

console.log(`[Firebase Purge] Target Project ID: ${firebaseConfig.projectId}`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const COLLECTIONS = ['products', 'categories', 'orders', 'users', 'notifications', 'settings'];
const STORAGE_FOLDERS = ['products', 'avatars', 'general'];

async function purgeCollections() {
  console.log('\n--- Purging Firestore Collections ---');
  for (const colName of COLLECTIONS) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        console.log(`  - '${colName}': 0 documents found (already clean).`);
        continue;
      }

      const docs = snapshot.docs;
      let deleted = 0;
      for (let i = 0; i < docs.length; i += 400) {
        const chunk = docs.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += chunk.length;
      }
      console.log(`  ✓ '${colName}': Permanently removed ${deleted} documents.`);
    } catch (err) {
      console.warn(`  ! '${colName}': ${err.message}`);
    }
  }
}

async function purgeStorageFolder(folderPath) {
  try {
    const folderRef = ref(storage, folderPath);
    const res = await listAll(folderRef);
    let count = 0;
    for (const itemRef of res.items) {
      try {
        await deleteObject(itemRef);
        count++;
      } catch (err) {
        console.warn(`    Failed to delete ${itemRef.fullPath}:`, err.message);
      }
    }
    for (const subfolder of res.prefixes) {
      count += await purgeStorageFolder(subfolder.fullPath);
    }
    return count;
  } catch (err) {
    return 0;
  }
}

async function purgeStorage() {
  console.log('\n--- Purging Firebase Storage Files ---');
  for (const folder of STORAGE_FOLDERS) {
    try {
      const count = await purgeStorageFolder(folder);
      console.log(`  ✓ Storage folder '${folder}/': Removed ${count} files.`);
    } catch (err) {
      console.warn(`  ! Storage folder '${folder}/': ${err.message}`);
    }
  }
}

async function run() {
  console.log('====================================================');
  console.log('       RAMBO BIRIYANI - FIREBASE DATA PURGE         ');
  console.log('====================================================');
  await purgeCollections();
  await purgeStorage();
  console.log('\n====================================================');
  console.log('   PURGE COMPLETE: All database records wiped.     ');
  console.log('====================================================\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('[Firebase Purge Error]:', err);
  process.exit(1);
});
