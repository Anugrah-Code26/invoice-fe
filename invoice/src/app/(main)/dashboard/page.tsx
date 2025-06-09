'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  const token = session?.accessToken;
  if (!token) throw new Error('No access token found');

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };

    const [invoicesRes, clientsRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`, { headers }),
      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`, { headers }),
    ]);

    const invoices = invoicesRes.data;

    setInvoiceCount(invoices.length);
    setPaidCount(invoices.filter((i: any) => i.status === 'PAID').length);
    setPendingCount(invoices.filter((i: any) => i.status !== 'PENDING').length);
    setTotalRevenue(
      invoices
        .filter((i: any) => i.status === 'PAID')
        .reduce((sum: number, i: any) => sum + i.totalAmount, 0)
    );

    setClientCount(clientsRes.data.length);
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          {/* <h1 className="text-2xl font-bold">Welcome, {email}</h1> */}
          <p className="text-gray-600 mt-2">You are now logged in.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Invoices" value={invoiceCount} color="blue" />
        <Card title="Clients" value={clientCount} color="green" />
        <Card title="Paid Invoices" value={paidCount} color="emerald" />
        <Card title="Unpaid / Overdue" value={pendingCount} color="yellow" />
        <Card title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color="purple" />
      </div>
    </div>
  );
}

function Card({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div className={`bg-${color}-100 border-l-4 border-${color}-500 text-${color}-800 p-4 rounded`}>
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
