import { useEffect, useState } from 'react';
import { useClientStore } from '../store/clientStore';
import ClientList from '../components/clients/ClientList';
import ClientForm from '../components/clients/ClientForm';
import { Client } from '../types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Clients() {
  const { clients, loading, error, fetchClients, addClient, updateClient, deleteClient, searchClients } = useClientStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchClients(searchTerm);
    } else {
      fetchClients();
    }
  };

  const handleSubmit = async (data: Omit<Client, 'id'>) => {
    if (selectedClient) {
      await updateClient(selectedClient.id!, data);
    } else {
      await addClient(data);
    }
    setShowForm(false);
    setSelectedClient(undefined);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add New Client
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </form>

      {showForm ? (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {selectedClient ? 'Edit Client' : 'New Client'}
          </h2>
          <ClientForm
            initialData={selectedClient}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedClient(undefined);
            }}
          />
        </div>
      ) : (
        loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <ClientList
            clients={clients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      )}
    </div>
  );
}