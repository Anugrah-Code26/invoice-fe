'use client';

import { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
      password: Yup.string().required('Password wajib diisi'),
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

        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const role = payload.role || payload.roles;

        if (role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Login gagal');
      }
    },
  });

  return (
    <div className="flex min-h-screen">
      {/* Kiri: Ilustrasi dan sambutan */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-blue-700 text-white p-10 relative">
        <div className="z-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Selamat Datang Kembali</h1>
          <p className="text-lg max-w-md">
            Kelola invoice, pantau transaksi, dan tingkatkan efisiensi bisnis Anda.
          </p>
        </div>
      </div>

      {/* Kanan: Form login */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-800">Masuk ke Akun Anda</h2>
            <p className="text-gray-500 text-sm mt-1">Masukkan email dan password Anda</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className={`w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-blue-300'
                }`}
              />
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

          {/* Link register */}
          <p className="text-sm text-center text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
