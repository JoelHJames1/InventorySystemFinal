import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSalesStore } from '../store/salesStore';
import { useClientStore } from '../store/clientStore';
import { useInventoryStore } from '../store/inventoryStore';
import { Sale } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import InvoiceGenerator from '../components/sales/InvoiceGenerator';
import { format } from 'date-fns';

export default function SaleDetails() {
  const { id } = useParams<{ id: string }>();
  const { getSale } = useSalesStore();
  const { clients } = useClientStore();
  const { products } = useInventoryStore();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const fetchSale = async () => {
      if (id) {
        const saleData = await getSale(id);
        setSale(saleData);
        setLoading(false);
      }
    };
    fetchSale();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!sale) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Sale not found</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const client = clients.find(c => c.id === sale.clientId);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link
          to="/sales"
          className="text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Sales
        </Link>
        <button
          onClick={() => setShowInvoice(!showInvoice)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showInvoice ? 'Hide Invoice' : 'Show Invoice'}
        </button>
      </div>

      {showInvoice ? (
        <InvoiceGenerator sale={sale} />
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Sale Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Invoice #{sale.invoiceNumber}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(sale.date, 'MMMM d, yyyy')}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Client</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client?.name}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${sale.total.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Products</h4>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sale.products.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ${item.pricePerUnit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${(item.quantity * item.pricePerUnit).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}