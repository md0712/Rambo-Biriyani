import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

export const storageService = {
  /**
   * Upload an image to Firebase Storage
   * @param {File} file The file to upload
   * @param {string} folder 'products' | 'avatars' | 'general'
   * @param {function} onProgress Optional progress callback (percent: number)
   * @returns {Promise<string>} Download URL of the uploaded image
   */
  async uploadImage(file, folder = 'products', onProgress = null) {
    if (!file) throw new Error('No file provided for upload');

    // Create unique filename
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('[StorageService] Upload failed:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },

  /**
   * Delete an image from Firebase Storage by URL or path
   */
  async deleteImage(fileUrlOrPath) {
    try {
      let fileRef;
      if (fileUrlOrPath.startsWith('http')) {
        fileRef = ref(storage, fileUrlOrPath);
      } else {
        fileRef = ref(storage, fileUrlOrPath);
      }
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.warn('[StorageService] Failed to delete image:', error.message);
      return false;
    }
  },
};

export default storageService;
