'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import Link from 'next/link';
import { FiEdit, FiTrash, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [loading, setLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchProducts = async (options?: {
    search?: string, minPrice?: string, maxPrice?: string, updateUrl?: boolean
  }) => {
    try {
      setLoading(true);
      const token = session?.accessToken;
      if (!token) throw new Error('No access token found');

      const params = new URLSearchParams();

      const searchFilter = options?.search !== undefined ? options.search : search;
      const minPriceFilter = options?.minPrice !== undefined ? options.minPrice : minPrice;
      const maxPriceFilter = options?.maxPrice !== undefined ? options.maxPrice : maxPrice;

      if (searchFilter) params.append('search', searchFilter);
      if (minPriceFilter) params.append('minPrice', minPriceFilter);
      if (maxPriceFilter) params.append('maxPrice', maxPriceFilter);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products?${params.toString()}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProducts(response.data.data);

      if (options?.updateUrl) {
        router.replace(`/products?${params.toString()}`, { scroll: false })
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts({
      search,
      minPrice,
      maxPrice,
      updateUrl: true
    });
  };

  const handleReset = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    router.replace(`/products`, { scroll: false });
    fetchProducts({search: '', minPrice: '', maxPrice: '', updateUrl: true});
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    const token = session?.accessToken;
    if (!token) throw new Error('No access token found');

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setShowConfirmModal(false);
      setProductToDelete(null);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchProducts();
    }
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700">Products</h1>
        <Link href="/products/form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">+ Product</button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label htmlFor="search" className="mb-1 text-sm font-medium text-gray-600">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Name or description"
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="minPrice" className="mb-1 text-sm font-medium text-gray-600">Min Price</label>
            <input
              id="minPrice"
              type="number"
              min={0}
              placeholder="Min"
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="maxPrice" className="mb-1 text-sm font-medium text-gray-600">Max Price</label>
            <input
              id="maxPrice"
              type="number"
              min={0}
              placeholder="Max"
              className="border rounded-md px-3 py-2 border-gray-300 text-gray-700"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-end">
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
              disabled={loading}
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

      {loading && products.length === 0 ? (
        <p className="text-gray-700 flex items-center gap-2">
          <FiLoader className="animate-spin" /> Loading...
        </p>
      ) : products.length === 0 ? (
        <p className="text-gray-700">No products found.</p>
      ) : (
        <table className="w-full border table-auto text-gray-700">
          <thead className="bg-gray-200 text-gray-700 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th>Description</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t text-gray-700">
                <td className="p-2">{product.name}</td>
                <td>{product.description}</td>
                <td>${product.price.toFixed(2)}</td>
                <td className="flex justify-center space-x-4 items-center p-2">
                  <Link href={`/products/form?id=${product.id}`}>
                    <FiEdit className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800" />
                  </Link>
                  <FiTrash
                    onClick={() => openDeleteModal(product)}
                    className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
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
