'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/register/request`, { email });
      setSent(true);
      toast.success('Verification link has been sent to your email!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send verification link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 text-gray-700">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Account
        </h1>

        {sent ? (
          <div className="text-center text-gray-700">
            Please check your inbox or spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your active email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Verification Link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
