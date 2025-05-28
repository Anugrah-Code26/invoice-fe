'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Client } from '@/types/client';

export default function ClientForm() {
  const router = useRouter();
  const params = useSearchParams();
  const clientId = params.get('id');

  const [initialValues, setInitialValues] = useState<Client>({
    id: 0,
    name: '',
    email: '',
    address: '',
    phoneNumber: '',
    paymentPreferences: '',
  });

  useEffect(() => {
    if (clientId) {
      const fetchClient = async () => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${clientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInitialValues(response.data);
      };
      fetchClient();
    }
  }, [clientId]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      address: Yup.string(),
      phoneNumber: Yup.string(),
      paymentPreferences: Yup.string(),
    }),
    onSubmit: async (values) => {
      const token = localStorage.getItem('accessToken');
      if (clientId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${clientId}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      router.push('/clients');
    },
  });

  // Type-safe list of fields
  const fields: (keyof Client)[] = ['name', 'email', 'address', 'phoneNumber', 'paymentPreferences'];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{clientId ? 'Edit' : 'Add'} Client</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block capitalize">{field}</label>
            <input
              type="text"
              {...formik.getFieldProps(field)}
              className="w-full border p-2 rounded"
            />
            {formik.touched[field] && formik.errors[field] && (
              <p className="text-red-500 text-sm">{formik.errors[field]}</p>
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {clientId ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
}
