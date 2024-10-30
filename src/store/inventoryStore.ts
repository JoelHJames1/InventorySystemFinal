import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

interface InventoryStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (searchTerm: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      set({ products: productsData });
    } catch (error) {
      set({ error: 'Failed to fetch products' });
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'products'), product);
      const store = useInventoryStore.getState();
      await store.fetchProducts();
    } catch (error) {
      set({ error: 'Failed to add product' });
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, product) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, product);
      const store = useInventoryStore.getState();
      await store.fetchProducts();
    } catch (error) {
      set({ error: 'Failed to update product' });
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'products', id));
      const store = useInventoryStore.getState();
      await store.fetchProducts();
    } catch (error) {
      set({ error: 'Failed to delete product' });
    } finally {
      set({ loading: false });
    }
  },

  searchProducts: async (searchTerm) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'products'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      set({ products: productsData });
    } catch (error) {
      set({ error: 'Failed to search products' });
    } finally {
      set({ loading: false });
    }
  },
}));