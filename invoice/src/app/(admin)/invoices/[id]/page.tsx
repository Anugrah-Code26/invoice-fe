'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Invoice } from '@/types/invoice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const fetchInvoice = async () => {
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoice(response.data.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to fetch invoice.');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'PAID' | 'OVERDUE') => {
    const token = localStorage.getItem('accessToken');
    setUpdatingStatus(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/${id}/status/${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Invoice marked as ${newStatus}`);
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to update status.');
      console.error('Failed to update status', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // const handleDownloadPDF = () => {
  //   if (!invoiceRef.current) return;
  //   html2pdf()
  //     .from(invoiceRef.current)
  //     .set({
  //       margin: 0.5,
  //       filename: `Invoice-${invoice?.invoiceNumber}.pdf`,
  //       html2canvas: { scale: 2 },
  //       jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  //     })
  //     .save();
  // };

  const sendInvoiceEmail = async () => {
    const token = localStorage.getItem('accessToken');
    setSendingEmail(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/${id}/send-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Invoice email sent successfully!');
    } catch (error) {
      toast.error('Failed to send invoice email.');
      console.error(error);
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading invoice...</div>;
  if (!invoice) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded-xl">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Invoice #{invoice.invoiceNumber}</h1>
        <div className="text-sm text-gray-600">Status: {invoice.status}</div>
      </div>

      <div ref={invoiceRef} className="bg-white border p-6 rounded shadow-sm text-sm text-gray-700">
        <h2 className="text-xl font-semibold mb-2">Invoice Detail</h2>

        <div className="mb-4">
          <p><strong>Client:</strong> {invoice.clientName}</p>
          <p><strong>Email:</strong> {invoice.clientEmail}</p>
          <p><strong>Phone:</strong> {invoice.clientAddress}</p>
          <p><strong>Issue Date:</strong> {invoice.issueDate}</p>
          <p><strong>Due Date:</strong> {invoice.dueDate}</p>
        </div>

        <h3 className="font-bold mb-1">Items</h3>
        <table className="w-full border mb-2">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="text-left p-2">Product</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.productName}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right font-semibold text-base">
          Total: ${invoice.totalAmount.toFixed(2)}
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        {/* <button
          onClick={handleDownloadPDF}
          className="bg-gray-800 text-white font-bold px-4 py-2 rounded hover:bg-gray-900"
        >
          Download PDF
        </button> */}

        {invoice.status !== 'PAID' && (
          <button
            onClick={() => updateStatus('PAID')}
            disabled={updatingStatus}
            className={`px-4 py-2 rounded text-white font-bold ${
              updatingStatus ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {updatingStatus ? 'Updating...' : 'Mark as PAID'}
          </button>
        )}

        <button
          onClick={sendInvoiceEmail}
          disabled={sendingEmail}
          className={`px-4 py-2 rounded text-white font-bold ${
            sendingEmail ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {sendingEmail ? 'Sending...' : 'Send to Client'}
        </button>
      </div>
    </div>
  );
}
