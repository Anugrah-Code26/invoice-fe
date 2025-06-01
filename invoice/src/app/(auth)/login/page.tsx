'use client';

import { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
          values
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        Cookies.set('accessToken', accessToken);

        toast.success('Login successful! Redirecting...', {
          position: 'top-right',
          autoClose: 1500,
        });

        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const role = payload.role || payload.roles;

        setTimeout(() => {
          if (role === 'ADMIN') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard');
          }
        }, 1600);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Login failed', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    },
  });

  return (
    <>
      <ToastContainer />
      <div className="flex min-h-screen">
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-blue-700 text-white p-10 relative">
          <div className="z-10 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-lg max-w-md">
              Manage invoices, monitor transactions, and increase your business efficiency.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-800">Sign in to Your Account</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your email and password</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  {...formik.getFieldProps('email')}
                  className={`w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 ${
                    formik.touched.email && formik.errors.email
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-300'
                  }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...formik.getFieldProps('password')}
                  className={`w-full px-4 py-2 pr-10 border rounded-md text-gray-700 focus:outline-none focus:ring-2 ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:ring-blue-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
              >
                Login
              </button>
            </form>

            <p className="text-sm text-center text-gray-600">
              Don’t have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
