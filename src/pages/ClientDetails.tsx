import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientStore } from '../store/clientStore';
import { useSalesStore } from '../store/salesStore';
import { Client, Sale } from '../types';
import ClientForm from '../components/clients/ClientForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient, deleteClient } = useClientStore();
  const { sales } = useSalesStore();
  const [client, setClient] = useState<Client | null>(null);
  const [clientSales, setClientSales] = useState<Sale[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const foundClient = clients.find(c => c.id === id);
    if (foundClient) {
      setClient(foundClient);
      const filteredSales = sales.filter(sale => sale.clientId === id);
      setClientSales(filteredSales);
    }
  }, [id, clients, sales]);

  if (!client) {
    return <LoadingSpinner />;
  }

  const handleUpdate = async (data: Omit<Client, 'id'>) => {
    if (id) {
      await updateClient(id, data);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
      navigate('/clients');
    }
  };

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Client Details</h1>
        <div className="mt-3 sm:mt-0 space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Client'}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete Client
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <ClientForm
            initialData={client}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Client Information
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {client.name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {client.phone}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {client.email}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {client.address}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Sales History */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sales History</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${sale.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}