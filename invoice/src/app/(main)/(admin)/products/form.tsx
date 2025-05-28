'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Product } from '@/types/product';

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

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInitialValues(response.data);
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
      if (productId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products/${productId}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      router.push('/products');
    },
  });

  // Type-safe list of form fields
  const fields: (keyof Pick<Product, 'name' | 'description' | 'price'>)[] = ['name', 'description', 'price'];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{productId ? 'Edit' : 'Add'} Product</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block capitalize">{field}</label>
            <input
              type={field === 'price' ? 'number' : 'text'}
              {...formik.getFieldProps(field)}
              className="w-full border p-2 rounded"
            />
            {formik.touched[field] && formik.errors[field] && (
              <p className="text-red-500 text-sm">{formik.errors[field]}</p>
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {productId ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
}
