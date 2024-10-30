import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
}

interface SettingsStore {
  settings: CompanySettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: CompanySettings) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
}

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'CMJ Med Service',
  address: '123 Medical Center Drive',
  phone: '(555) 123-4567',
  email: 'info@cmjmedservice.com',
  logoUrl: '/logo.png'
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(db, 'settings', 'company');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        set({ settings: docSnap.data() as CompanySettings });
      } else {
        // Initialize with default settings if none exist
        await setDoc(docRef, DEFAULT_SETTINGS);
        set({ settings: DEFAULT_SETTINGS });
      }
    } catch (error) {
      set({ error: 'Failed to fetch settings' });
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(db, 'settings', 'company');
      await setDoc(docRef, newSettings);
      set({ settings: newSettings });
    } catch (error) {
      set({ error: 'Failed to update settings' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadLogo: async (file) => {
    try {
      const storageRef = ref(storage, `company/logo-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      throw new Error('Failed to upload logo');
    }
  }
}));