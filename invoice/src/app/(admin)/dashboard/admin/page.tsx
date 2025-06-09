'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // <-- loading state

  const fetchData = async () => {
    try {
      setIsLoading(true);  // <-- start loading
      const token = session?.accessToken;
      if (!token) throw new Error('No access token found');

      const headers = { Authorization: `Bearer ${token}` };

      const [invoicesRes, clientsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices/user/all`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/user/all`, { headers }),
      ]);

      const invoices = invoicesRes.data.data;

      setInvoiceCount(invoices.length);
      setPaidCount(invoices.filter((i: any) => i.status === 'PAID').length);
      setPendingCount(invoices.filter((i: any) => i.status === 'PENDING').length);
      setTotalRevenue(
        invoices
          .filter((i: any) => i.status === 'PAID')
          .reduce((sum: number, i: any) => sum + i.totalAmount, 0)
      );

      setClientCount(clientsRes.data.data.length);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error?.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);  // <-- stop loading
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-700 text-xl">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-gray-700 font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 text-gray-700 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Invoices" value={invoiceCount} />
        <DashboardCard title="Total Clients" value={clientCount} />
        <DashboardCard title="Paid Invoices" value={paidCount} />
        <DashboardCard title="Pending" value={pendingCount} />
        <DashboardCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white shadow-sm border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
