'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FormValues = {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phoneNumber: Yup.string(),
      address: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setSubmitLoading(true);
        const token = localStorage.getItem('accessToken');
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error(error);
        toast.error('Failed to update profile');
      } finally {
        setSubmitLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        formik.setValues(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-4">Loading profile...</div>;

  const fields: (keyof FormValues)[] = ['name', 'email', 'phoneNumber', 'address'];

  return (
    <div className="max-w-xl mx-auto p-6 text-gray-700 bg-white rounded-xl">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block capitalize mb-1">{field}</label>
            <input
              type="text"
              name={field}
              value={formik.values[field]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-2 rounded"
            />
            {formik.errors[field] && formik.touched[field] && (
              <p className="text-red-500 text-sm">{formik.errors[field]}</p>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 font-bold text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={submitLoading}
        >
          {submitLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
