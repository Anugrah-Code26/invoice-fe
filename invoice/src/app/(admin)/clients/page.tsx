'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Client } from '@/types/client';
import Link from 'next/link';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash } from 'react-icons/fi';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchClients = async (searchQuery = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: searchQuery },
        }
      );
      setClients(response.data.data);
    } catch (err) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce((value: string) => {
    fetchClients(value);
  }, 300);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const openDeleteModal = (client: Client) => {
    setClientToDelete(client);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!clientToDelete) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${clientToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Client deleted successfully');
      fetchClients(search);
    } catch (err) {
      toast.error('Failed to delete client');
    } finally {
      setShowModal(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl text-gray-700 font-bold">Clients</h1>
        <Link href="/clients/form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">+ Client</button>
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Find by name, email, or phone number..."
        className="mb-4 w-full border px-3 py-2 rounded text-sm text-gray-700"
      />

      {loading ? (
        <p className="text-gray-700">Loading clients...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-700">No clients found.</p>
      ) : (
        <table className="w-full border table-auto text-gray-700">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t text-gray-700">
                <td className="p-2">{client.name}</td>
                <td>{client.email}</td>
                <td>{client.phoneNumber}</td>
                <td className="flex space-x-4 items-center p-2">
                  <Link href={`/clients/form?id=${client.id}`}>
                    <FiEdit
                      className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800"
                      title="Edit"
                      aria-label="Edit client"
                      style={{ display: 'block' }}
                    />
                  </Link>
                  <FiTrash
                    onClick={() => openDeleteModal(client)}
                    className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800"
                    title="Delete"
                    aria-label="Delete client"
                    style={{ display: 'block' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
