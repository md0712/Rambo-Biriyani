import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

/**
 * List of collections in Firestore managed by the Rambo Biriyani application
 */
export const TARGET_COLLECTIONS = [
  'products',
  'categories',
  'orders',
  'users',
  'notifications',
  'settings'
];

/**
 * List of storage folders used by the application
 */
export const TARGET_STORAGE_FOLDERS = [
  'products',
  'avatars',
  'general'
];

/**
 * Delete all documents in a specific collection
 * @param {string} collectionName
 * @returns {Promise<number>} Number of documents deleted
 */
export async function clearCollection(collectionName) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log(`[Database Reset] Collection '${collectionName}' is already empty.`);
      return 0;
    }

    let deletedCount = 0;
    // Process in batches of up to 400 (Firestore limit is 500 ops per batch)
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const chunk = docs.slice(i, i + 400);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deletedCount += chunk.length;
    }

    console.log(`[Database Reset] Deleted ${deletedCount} docs from '${collectionName}'.`);
    return deletedCount;
  } catch (error) {
    console.error(`[Database Reset] Error clearing collection '${collectionName}':`, error);
    throw error;
  }
}

/**
 * Recursively delete all files in a Firebase Storage folder
 * @param {string} folderPath
 * @returns {Promise<number>} Number of files deleted
 */
export async function clearStorageFolder(folderPath) {
  try {
    const folderRef = ref(storage, folderPath);
    const res = await listAll(folderRef);

    let deletedCount = 0;

    // Delete all files in current folder
    const filePromises = res.items.map(async (itemRef) => {
      try {
        await deleteObject(itemRef);
        deletedCount++;
      } catch (err) {
        console.warn(`[Storage Reset] Failed to delete file ${itemRef.fullPath}:`, err.message);
      }
    });
    await Promise.all(filePromises);

    // Recursively clear subfolders
    for (const prefixRef of res.prefixes) {
      deletedCount += await clearStorageFolder(prefixRef.fullPath);
    }

    console.log(`[Storage Reset] Deleted ${deletedCount} files from folder '${folderPath}'.`);
    return deletedCount;
  } catch (error) {
    console.warn(`[Storage Reset] Notice/Error on folder '${folderPath}':`, error.message);
    return 0;
  }
}

/**
 * Reset all application collections and storage files
 * @returns {Promise<{ collections: Record<string, number>, storageFiles: Record<string, number>, totalDocsDeleted: number, totalFilesDeleted: number }>}
 */
export async function resetCompleteFirebaseData() {
  console.log('[Database Reset] Starting full application data purge...');

  const result = {
    collections: {},
    storageFiles: {},
    totalDocsDeleted: 0,
    totalFilesDeleted: 0
  };

  // 1. Purge Firestore Collections
  for (const colName of TARGET_COLLECTIONS) {
    const count = await clearCollection(colName);
    result.collections[colName] = count;
    result.totalDocsDeleted += count;
  }

  // 2. Purge Firebase Storage Folders
  for (const folder of TARGET_STORAGE_FOLDERS) {
    const fileCount = await clearStorageFolder(folder);
    result.storageFiles[folder] = fileCount;
    result.totalFilesDeleted += fileCount;
  }

  console.log('[Database Reset] Purge completed successfully:', result);
  return result;
}

export default resetCompleteFirebaseData;
