import { create } from 'zustand';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sale } from '../types';
import { format } from 'date-fns';

interface SalesStore {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'invoiceNumber'>) => Promise<string>;
  getSale: (id: string) => Promise<Sale | null>;
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  sales: [],
  loading: false,
  error: null,

  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'sales'));
      const salesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date((doc.data().date as any).seconds * 1000)
      })) as Sale[];
      set({ sales: salesData });
    } catch (error) {
      set({ error: 'Failed to fetch sales' });
    } finally {
      set({ loading: false });
    }
  },

  addSale: async (saleData) => {
    set({ loading: true, error: null });
    try {
      const date = new Date();
      const invoiceNumber = `INV-${format(date, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const sale = {
        ...saleData,
        invoiceNumber,
        date
      };

      const docRef = await addDoc(collection(db, 'sales'), sale);
      await get().fetchSales();
      return docRef.id;
    } catch (error) {
      set({ error: 'Failed to add sale' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getSale: async (id) => {
    try {
      const docRef = doc(db, 'sales', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          date: new Date((data.date as any).seconds * 1000)
        } as Sale;
      }
      return null;
    } catch (error) {
      set({ error: 'Failed to fetch sale' });
      return null;
    }
  }
}));