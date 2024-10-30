import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Client } from '../types';

interface ClientStore {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  searchClients: (searchTerm: string) => Promise<void>;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      set({ clients: clientsData });
    } catch (error) {
      set({ error: 'Failed to fetch clients' });
    } finally {
      set({ loading: false });
    }
  },

  addClient: async (client) => {
    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'clients'), client);
      const store = useClientStore.getState();
      await store.fetchClients();
    } catch (error) {
      set({ error: 'Failed to add client' });
    } finally {
      set({ loading: false });
    }
  },

  updateClient: async (id, client) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(db, 'clients', id);
      await updateDoc(docRef, client);
      const store = useClientStore.getState();
      await store.fetchClients();
    } catch (error) {
      set({ error: 'Failed to update client' });
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'clients', id));
      const store = useClientStore.getState();
      await store.fetchClients();
    } catch (error) {
      set({ error: 'Failed to delete client' });
    } finally {
      set({ loading: false });
    }
  },

  searchClients: async (searchTerm) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'clients'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      set({ clients: clientsData });
    } catch (error) {
      set({ error: 'Failed to search clients' });
    } finally {
      set({ loading: false });
    }
  },
}));