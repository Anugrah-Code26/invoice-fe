'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Client } from '@/types/client';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(token);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: number) => {
    if (!confirm('Delete this client?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchClients();
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/clients/form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Add Client</button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <p>No clients yet.</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="p-2">{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phoneNumber}</td>
                <td className="space-x-2">
                  <Link href={`/clients/form?id=${client.id}`}>
                    <button className="text-blue-600">Edit</button>
                  </Link>
                  <button onClick={() => deleteClient(client.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
