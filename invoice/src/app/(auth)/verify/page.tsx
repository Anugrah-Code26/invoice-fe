'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get('verificationToken');
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Verification token not found!');
      router.push('/register');
    }
  }, [token, router]);

  const formik = useFormik({
    initialValues: {
      name: '',
      password: '',
      confirmPassword: '',
      address: '',
      phoneNumber: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required!'),
      password: Yup.string()
        .min(6, 'Minimum 6 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character')
        .required('Password is required!'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Password confirmation does not match')
        .required('Password confirmation is required!'),
      address: Yup.string(),
      phoneNumber: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/register/complete?verificationToken=${token}`,
          {
            name: values.name,
            password: values.password,
            address: values.address,
            phoneNumber: values.phoneNumber,
          }
        );
        toast.success('Registration success!');
        router.push('/login');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Registration Failed!');
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 text-gray-700">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Complete Your Profile</h1>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input
              type="text"
              {...formik.getFieldProps('name')}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Fullname"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...formik.getFieldProps('password')}
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                {...formik.getFieldProps('confirmPassword')}
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{formik.errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Address</label>
            <input
              type="text"
              {...formik.getFieldProps('address')}
              className="w-full border px-4 py-2 rounded focus:outline-none"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              {...formik.getFieldProps('phoneNumber')}
              className="w-full border px-4 py-2 rounded focus:outline-none"
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
          >
            Veify & Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}
