'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);

      // Decode JWT role (tanpa library eksternal)
      const payload = JSON.parse(atob(token.split('.')[1]));
      setRole(payload.role || payload.roles || 'USER');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b px-6 py-3 shadow-sm flex justify-between items-center">
      <Link href="/" className="text-lg font-bold text-blue-600">
        InvoiceApp
      </Link>

      <div className="space-x-4 text-sm">
        {!isLoggedIn ? (
          <>
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Daftar
            </Link>
          </>
        ) : (
          <>
            <Link
              href={role === 'ADMIN' ? '/dashboard/admin' : '/dashboard'}
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
