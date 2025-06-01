'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Invoice } from '@/types/invoice';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchInvoices = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setInvoices(response.data.data);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-700">Invoices</h1>
        <Link href="/invoices/form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Invoice</button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className='text-gray-700'>No invoices yet.</p>
      ) : (
        <table className="w-full border table-auto text-gray-700">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="p-2">Invoice #</th>
              <th>Client</th>
              <th>Status</th>
              <th>Due</th>
              <th>Total</th>
              <th>Action</th>
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
                  <Link href={`/invoices/${invoice.id}`} className="text-blue-600">
                    View
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
