import { db, auth } from '../firebase/config';
import { seedInitialFirestoreData } from '../firebase/seed';

// Initialize and ensure Firestore collections are seeded
export const initFirestoreData = async () => {
  try {
    await seedInitialFirestoreData(false);
  } catch (err) {
    console.warn('[Firebase Init] Firestore seeder notice:', err.message);
  }
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.rambobiriyani.com/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getHeaders() {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders();
    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[ApiClient] Request to ${url} failed:`, err.message);
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(BASE_URL);
export default api;
