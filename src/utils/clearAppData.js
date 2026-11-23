// src/utils/clearAppData.js
/**
 * Clears all client‑side data for the Rambo app:
 *   • Removes the fallback‑user entry from localStorage.
 *   • Deletes any debug‑log entry you may have created.
 *   • Clears the Firestore persistent offline cache (IndexedDB).
 *   • Empties sessionStorage.
 *
 * Call this function in a browser context (e.g. from a button click).
 */
export const clearAppData = async () => {
  // 1️⃣ Remove fallback user & optional debug log
  localStorage.removeItem('rambo_fallback_user');
  localStorage.removeItem('rambo_debug_log');

  // 2️⃣ Clear session storage (if you ever store anything there)
  sessionStorage.clear();

  // 3️⃣ Delete the Firestore offline cache (IndexedDB)
  // The Firestore SDK creates a database whose name starts with "firebase".
  if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
    try {
      const dbInfos = await indexedDB.databases();
      const firebaseDbs = dbInfos.filter(
        (info) => info.name && info.name.startsWith('firebase')
      );
      for (const db of firebaseDbs) {
        indexedDB.deleteDatabase(db.name);
        console.info(`[clearAppData] Deleted IndexedDB "${db.name}"`);
      }
    } catch (e) {
      console.warn('[clearAppData] Unable to enumerate IndexedDB databases:', e);
    }
  } else if (typeof indexedDB !== 'undefined') {
    // Fallback: try a typical cache name used by older SDK versions
    const fallbackName = 'firebase-local-storage';
    indexedDB.deleteDatabase(fallbackName);
    console.info(`[clearAppData] Attempted deletion of "${fallbackName}"`);
  }

  console.log('🚀 All client‑side data cleared.');
};
