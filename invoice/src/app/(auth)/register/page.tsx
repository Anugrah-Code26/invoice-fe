'use client';

import { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      name: '',
      address: '',
      phoneNumber: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Required'),
      name: Yup.string().required('Required'),
      address: Yup.string(),
      phoneNumber: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/register`, values);
        router.push('/login');
      } catch (err: any) {
        setError(err.response?.data || 'Registration failed');
      }
    },
  });

  const fields: (keyof typeof formik.values)[] = ['email', 'password', 'name', 'address', 'phoneNumber'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium capitalize">
                {field === 'phoneNumber' ? 'Phone Number' : field}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                {...formik.getFieldProps(field)}
                className={`w-full mt-1 px-3 py-2 border rounded-md ${
                  formik.touched[field] && formik.errors[field]
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched[field] && formik.errors[field] && (
                <p className="text-red-500 text-xs">{formik.errors[field]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
