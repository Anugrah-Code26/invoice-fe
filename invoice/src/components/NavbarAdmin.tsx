import Link from 'next/link';

export default function NavbarAdmin() {

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b px-6 py-3 shadow-sm flex justify-between items-center">
      <Link href="/" className="text-lg font-bold text-blue-600">
        MyInvoice
      </Link>

      <div className="space-x-4 text-sm">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-red-500"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
