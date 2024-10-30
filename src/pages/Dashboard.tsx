import { useEffect, useState } from 'react';
import { useClientStore } from '../store/clientStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useSalesStore } from '../store/salesStore';
import WelcomeMessage from '../components/WelcomeMessage';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { clients, fetchClients } = useClientStore();
  const { products, fetchProducts } = useInventoryStore();
  const { sales, fetchSales } = useSalesStore();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<number>(0);
  const [recentSales, setRecentSales] = useState(0);
  const [activeClients, setActiveClients] = useState(0);

  useEffect(() => {
    fetchClients();
    fetchProducts();
    fetchSales();
  }, []);

  useEffect(() => {
    // Calculate total revenue
    const revenue = sales.reduce((total, sale) => total + sale.total, 0);
    setTotalRevenue(revenue);

    // Count low stock products (less than 10 items)
    const lowStock = products.filter(product => product.quantity < 10).length;
    setLowStockProducts(lowStock);

    // Calculate recent sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSalesCount = sales.filter(sale => 
      new Date(sale.date) >= thirtyDaysAgo
    ).length;
    setRecentSales(recentSalesCount);

    // Calculate active clients (clients with purchases in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const activeClientsSet = new Set(
      sales
        .filter(sale => new Date(sale.date) >= ninetyDaysAgo)
        .map(sale => sale.clientId)
    );
    setActiveClients(activeClientsSet.size);
  }, [sales, products, clients]);

  return (
    <div className="p-6">
      <WelcomeMessage />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Sales (30 days)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {recentSales}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Clients Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Clients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeClients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Low Stock Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {lowStockProducts}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((sale) => {
                  const client = clients.find(c => c.id === sale.clientId);
                  return (
                    <tr key={sale.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client?.name || 'Unknown Client'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${sale.total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}