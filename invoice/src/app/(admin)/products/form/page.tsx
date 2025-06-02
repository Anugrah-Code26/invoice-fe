'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Product } from '@/types/product';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi';

export default function ProductForm() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get('id');

  const [initialValues, setInitialValues] = useState<Product>({
    id: 0,
    name: '',
    description: '',
    price: 0,
    deleted: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setInitialValues(response.data.data);
        } catch (error) {
          console.error('Failed to fetch product:', error);
          toast.error('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const formik = useFormik<Product>({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      description: Yup.string(),
      price: Yup.number().required('Required').positive('Must be positive'),
      deleted: Yup.boolean(),
      id: Yup.number(),
    }),
    onSubmit: async (values) => {
      const token = localStorage.getItem('accessToken');
      setLoading(true);
      try {
        if (productId) {
          await axios.put(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}`,
            values,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Product updated successfully');
        } else {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`,
            values,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Product added successfully');
        }
        router.push('/products');
      } catch (error) {
        console.error('Failed to submit product:', error);
        toast.error('Failed to submit product');
      } finally {
        setLoading(false);
      }
    },
  });

  const fields: (keyof Pick<Product, 'name' | 'description' | 'price'>)[] = [
    'name',
    'description',
    'price',
  ];

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl">
      <h1 className="text-2xl text-gray-700 font-bold mb-4">
        {productId ? 'Edit' : 'Add'} Product
      </h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block capitalize text-gray-700">{field}</label>
            <input
              type={field === 'price' ? 'number' : 'text'}
              {...formik.getFieldProps(field)}
              className="w-full border p-2 rounded text-gray-700"
              disabled={loading}
            />
            {formik.touched[field] && formik.errors[field] && (
              <p className="text-red-500 text-sm">{formik.errors[field]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 font-bold text-white px-4 py-2 rounded flex justify-center items-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading && <FiLoader className="animate-spin" />}
          {productId ? 'UPDATE' : 'ADD'}
        </button>
      </form>
    </div>
  );
}
