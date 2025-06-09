'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Client } from '@/types/client';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

export default function ClientForm() {
  const router = useRouter();
  const params = useSearchParams();
  const clientId = params.get('id');
  const { data: session } = useSession();

  const [initialValues, setInitialValues] = useState<Client>({
    id: 0,
    name: '',
    email: '',
    address: '',
    phoneNumber: '',
    paymentPreferences: '',
  });

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const paymentOptions = [
    'Bank Transfer',
    'Credit Card',
    'PayPal',
    'Cash',
    'E-Wallet',
  ];

  const fieldLabels: Record<keyof Client, string> = {
    id: 'ID',
    name: 'Name',
    email: 'Email',
    address: 'Address',
    phoneNumber: 'Phone Number',
    paymentPreferences: 'Payment Preferences',
  };

  useEffect(() => {
    if (clientId) {
      const fetchClient = async () => {
        try {
          setIsFetching(true);
          const token = session?.accessToken;
          if (!token) throw new Error('No access token found');
          
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${clientId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setInitialValues(response.data.data);
        } catch (error) {
          console.error('Failed to fetch client:', error);
          toast.error('Failed to load client data');
        } finally {
          setIsFetching(false);
        }
      };
      if (session?.accessToken) {
        fetchClient();
      }
    }
  }, [clientId, session]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      address: Yup.string(),
      phoneNumber: Yup.string(),
      paymentPreferences: Yup.string().required('Required')
    }),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const token = session?.accessToken;
        if (!token) throw new Error('No access token found');

        if (clientId) {
          await axios.put(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${clientId}`,
            values,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Client updated successfully');
        } else {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`,
            values,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Client added successfully');
        }

        router.push('/clients');
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Failed to save client. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fields: (keyof Client)[] = ['name', 'email', 'address', 'phoneNumber'];

  if (clientId && isFetching) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center text-gray-600">
        Loading client data...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl">
      <h1 className="text-2xl text-gray-700 font-bold mb-4">{clientId ? 'Edit' : 'Add'} Client</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block capitalize text-gray-700">{fieldLabels[field]}</label>
            <input
              type="text"
              {...formik.getFieldProps(field)}
              className="w-full border border-gray-300 bg-white p-2 text-gray-700 rounded"
              disabled={isSubmitting}
            />
            {formik.touched[field] && formik.errors[field] && (
              <p className="text-red-500 text-sm">{formik.errors[field]}</p>
            )}
          </div>
        ))}

        <div>
          <label className="block text-gray-700">{fieldLabels.paymentPreferences}</label>
          <select
            {...formik.getFieldProps('paymentPreferences')}
            className="w-full border border-gray-300 bg-white p-2 text-gray-700 rounded"
            disabled={isSubmitting}
          >
            <option value="">Select a payment method</option>
            {paymentOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {formik.touched.paymentPreferences && formik.errors.paymentPreferences && (
            <p className="text-red-500 text-sm">{formik.errors.paymentPreferences}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!formik.isValid || isSubmitting}
          className="w-full bg-blue-600 text-white font-bold px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : clientId ? 'UPDATE' : 'ADD'}
        </button>
      </form>
    </div>
  );
}
