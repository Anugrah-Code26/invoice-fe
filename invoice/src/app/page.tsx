import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-blue-700">Invoice Management App</h1>
        <p className="text-gray-600 mb-6 text-lg">
          Create and send professional invoices quickly. Perfect for freelancers, SMEs, and online business owners.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Register Now
          </a>
          <a
            href="/login"
            className="bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50"
          >
            Log In
          </a>
        </div>

        <div className="mt-10 text-sm text-gray-400">
          Built with 💙 by you, for better financial management.
        </div>
      </div>
    </main>
  );
}
