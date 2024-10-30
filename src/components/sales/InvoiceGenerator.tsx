import { useRef } from 'react';
import { format } from 'date-fns';
import { Sale } from '../../types';
import { useClientStore } from '../../store/clientStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { useSettingsStore } from '../../store/settingsStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceGeneratorProps {
  sale: Sale;
}

export default function InvoiceGenerator({ sale }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { clients } = useClientStore();
  const { products } = useInventoryStore();
  const { settings } = useSettingsStore();
  const client = clients.find(c => c.id === sale.clientId);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

    // Add new pages if content exceeds one page
    let heightLeft = imgHeight - pageHeight;
    let position = -pageHeight;

    while (heightLeft >= 0) {
      position = position - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`invoice-${sale.invoiceNumber}.pdf`);
  };

  return (
    <div>
      <div ref={invoiceRef} className="bg-white p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img 
              src={settings?.logoUrl || '/logo.png'} 
              alt={settings?.name} 
              className="h-16 w-auto mr-4" 
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{settings?.name}</h1>
              <p className="text-gray-600">Medical Supplies & Services</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-gray-600">#{sale.invoiceNumber}</p>
            <p className="text-gray-600">{format(sale.date, 'MMMM d, yyyy')}</p>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Bill To:</h3>
            <p className="font-bold">{client?.name}</p>
            <p>{client?.address}</p>
            <p>{client?.phone}</p>
            <p>{client?.email}</p>
          </div>
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Payment Details:</h3>
            <p>Due Date: {format(sale.date, 'MMMM d, yyyy')}</p>
          </div>
        </div>

        {/* Products Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.products.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{product?.name}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">${item.pricePerUnit.toFixed(2)}</td>
                  <td className="text-right py-2">
                    ${(item.quantity * item.pricePerUnit).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={3} className="text-right py-4">Total:</td>
              <td className="text-right py-4">${sale.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="text-gray-600 text-sm">
          <p className="mb-2">Thank you for your business!</p>
          <div className="border-t pt-4 mt-4">
            <p>{settings?.name}</p>
            <p>{settings?.address}</p>
            <p>Phone: {settings?.phone}</p>
            <p>Email: {settings?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 mb-6">
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Download Invoice PDF
        </button>
      </div>
    </div>
  );
}