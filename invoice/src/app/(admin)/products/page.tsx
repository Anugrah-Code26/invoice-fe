'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Product } from '@/types/product';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(response.data.data);
  };

  const deleteProduct = async (id: number) => {
    const confirmDelete = confirm('Delete this product?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('accessToken');
    await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-700">Products</h1>
        <Link href="/products/form">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Add Product</button>
        </Link>
      </div>

      {products.length === 0 ? (
        <p className='text-gray-700'>No products found.</p>
      ) : (
        <table className="w-full border table-auto text-gray-700">
          <thead className="bg-gray-200 text-gray-700 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t text-gray-700">
                <td className="p-2">{product.name}</td>
                <td>{product.description}</td>
                <td>${product.price.toFixed(2)}</td>
                <td className="space-x-2">
                  <Link href={`/products/form?id=${product.id}`}>
                    <button className="text-blue-600">Edit</button>
                  </Link>
                  <button onClick={() => deleteProduct(product.id)} className="text-red-600">
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
