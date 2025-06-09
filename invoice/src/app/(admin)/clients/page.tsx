'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Client } from '@/types/client';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { FiEdit, FiLoader, FiTrash } from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState(searchParams.get('name') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phoneNumber') || '');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchClients = async (options?: {
    name?: string, email?: string, phoneNumber?: string, updateUrl?: boolean
  }) => {
    try {
      setLoading(true);
      const token = session?.accessToken;
      if (!token) throw new Error('No access token found');

      const params = new URLSearchParams();

      const nameFilter = options?.name !== undefined ? options.name : name
      const emailFilter = options?.email !== undefined ? options.email : email
      const phoneNumberFilter = options?.phoneNumber !== undefined ? options.phoneNumber : phoneNumber

      if (nameFilter) params.append('name', nameFilter);
      if (emailFilter) params.append('email', emailFilter);
      if (phoneNumberFilter) params.append('phoneNumber', phoneNumberFilter);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setClients(response.data.data);

      if (options?.updateUrl) {
        router.replace(`/clients?${params.toString()}`, { scroll: false })
      }
    } catch (error: any) {
      toast.error(`Failed to fetch clients: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchClients();
    }
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients({
      name,
      email,
      phoneNumber,
      updateUrl: true
    });
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhoneNumber('');
    router.replace(`/clients`, { scroll: false });
    fetchClients({name: '', email:'', phoneNumber:'', updateUrl: true});
  };

  const openDeleteModal = (client: Client) => {
    setClientToDelete(client);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!clientToDelete) return;
    try {
      const token = session?.accessToken;
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${clientToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (err) {
      toast.error('Failed to delete client');
    } finally {
      setShowModal(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <Link href="/clients/form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            + Client
          </button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label htmlFor='name' className='mb-1 text-sm font-medium text-gray-600'>Name</label>
            <input
              id='name'
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor='email' className='mb-1 text-sm font-medium text-gray-600'>Email</label>
            <input
              id='email'
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor='phoneNumber' className='mb-1 text-sm font-medium text-gray-600'>Phone Number</label>
            <input
              id='phoneNumber'
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
            />
          </div>

          <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-end">
            <button
              type='submit'
              disabled={loading}
              onClick={handleSearch}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              {loading ? <FiLoader className="animate-spin" /> : 'Search'}
            </button>
            <button
              type='button'
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
        <p className="text-gray-700">Loading clients...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-700">No clients found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border text-gray-800">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="p-3">{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phoneNumber}</td>
                  <td className="flex gap-4 justify-center py-2">
                    <Link href={`/clients/form?id=${client.id}`}>
                      <FiEdit
                        className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800"
                        title="Edit"
                      />
                    </Link>
                    <FiTrash
                      onClick={() => openDeleteModal(client)}
                      className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800"
                      title="Delete"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && clientToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Client</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{clientToDelete.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setClientToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
