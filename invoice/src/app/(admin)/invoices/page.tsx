'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Invoice } from '@/types/invoice';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import { AiOutlineEye } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';
import { FiLoader } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
];

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState(searchParams.get('invoiceNumber') || '');
  const [clientName, setClientName] = useState(searchParams.get('clientName') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async (options?: {
    invoiceNumber?: string, clientName?: string, date?: string, status?: string, updateUrl?: boolean
  }) => {
    setLoading(true);
    try {
      const token = session?.accessToken;
      if (!token) throw new Error('No access token found');

      const params = new URLSearchParams();

      const invoiceNumberFilter = options?.invoiceNumber !== undefined ? options.invoiceNumber : invoiceNumber;
      const clientNameFilter = options?.clientName !== undefined ? options.clientName : clientName;
      const dateFilter = options?.date !== undefined ? options.date : date;
      const statusFilter = options?.status !== undefined ? options.status : status;

      if (invoiceNumberFilter) params.append('invoiceNumber', invoiceNumberFilter);
      if (clientNameFilter) params.append('clientName', clientNameFilter);
      if (dateFilter) params.append('date', dateFilter);
      if (statusFilter && statusFilter !== '') params.append('status', statusFilter);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInvoices(response.data.data || []);

      if (options?.updateUrl) {
        router.replace(`/invoices?${params.toString()}`, { scroll: false });
      }
    } catch (error: any) {
      toast.error(`Failed to fetch invoices: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchInvoices();
    }
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices({
      invoiceNumber,
      clientName,
      date,
      status,
      updateUrl: true
    });
  };

  const handleReset = () => {
    setInvoiceNumber('');
    setClientName('');
    setDate('');
    setStatus('');
    router.replace(`/invoices`, { scroll: false });
    fetchInvoices({
      invoiceNumber: '',
      clientName: '',
      date: '',
      status: '',
      updateUrl: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl">
      <ToastContainer />
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-700">Invoices</h1>
        <Link href="/invoices/form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Invoice</button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label htmlFor="invoiceNumber" className="mb-1 text-sm font-medium text-gray-600">Invoice Number</label>
            <input
              id="invoiceNumber"
              type="text"
              placeholder="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="clientName" className="mb-1 text-sm font-medium text-gray-600">Client Name</label>
            <input
              id="clientName"
              type="text"
              placeholder="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="date" className="mb-1 text-sm font-medium text-gray-600">Due Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-600">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              {loading ? <FiLoader className="animate-spin" /> : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <p className="text-gray-700">Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p className="text-gray-700">No invoices yet.</p>
      ) : (
        <table className="w-full border table-auto text-gray-700">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="p-2">Invoice #</th>
              <th>Client</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t text-gray-700">
                <td className="p-2">{invoice.invoiceNumber}</td>
                <td>{invoice.clientName}</td>
                <td>{invoice.status}</td>
                <td>{invoice.dueDate}</td>
                <td>${invoice.totalAmount.toFixed(2)}</td>
                <td>
                  <Link href={`/invoices/${invoice.id}`} className="text-blue-600" aria-label="View Invoice">
                    <AiOutlineEye size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
