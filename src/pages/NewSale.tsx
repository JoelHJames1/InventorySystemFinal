import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../store/clientStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useSalesStore } from '../store/salesStore';
import { Product } from '../types';

interface SaleItem {
  productId: string;
  quantity: number;
  pricePerUnit: number;
}

export default function NewSale() {
  const navigate = useNavigate();
  const { clients } = useClientStore();
  const { products, updateProduct } = useInventoryStore();
  const { addSale } = useSalesStore();

  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (product && quantity > 0 && quantity <= product.quantity) {
      setItems([
        ...items,
        {
          productId: product.id!,
          quantity,
          pricePerUnit: product.price
        }
      ]);
      setSelectedProduct('');
      setQuantity(1);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.pricePerUnit);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0) return;

    try {
      // Update product quantities
      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await updateProduct(product.id!, {
            quantity: product.quantity - item.quantity
          });
        }
      }

      // Create sale
      const saleId = await addSale({
        clientId,
        products: items,
        total: calculateTotal(),
        date: new Date()
      });

      navigate(`/sales/${saleId}`);
    } catch (error) {
      console.error('Failed to create sale:', error);
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Sale</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Client Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select the client for this sale.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Products</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add products to the sale.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select a product</option>
                    {products
                      .filter(p => p.quantity > 0)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (${product.price.toFixed(2)} - {product.quantity} available)
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct ? getProductById(selectedProduct)?.quantity : 1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedProduct}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300"
                  >
                    Add
                  </button>
                </div>

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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                      const product = getProductById(item.productId);
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        Total:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ${calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/sales')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!clientId || items.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
          >
            Create Sale
          </button>
        </div>
      </form>
    </div>
  );
}