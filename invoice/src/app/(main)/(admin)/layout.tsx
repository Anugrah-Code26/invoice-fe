'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiPackage,
  FiFileText,
} from "react-icons/fi";

const adminNav = [
  { label: "Dashboard", href: "/dashboard/admin", icon: FiHome },
  { label: "Kelola Klien", href: "/clients", icon: FiUsers },
  { label: "Kelola Produk", href: "/products", icon: FiPackage },
  { label: "Semua Invoice", href: "/invoices", icon: FiFileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <html lang="id">
      <body className="flex bg-gray-50 min-h-screen text-sm">
        {/* Sidebar */}
        <aside
          className={`bg-blue-900 text-white min-h-screen p-4 space-y-4 flex flex-col transition-[width] duration-300 ease-in-out ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Toggle */}
          <div className="flex justify-between items-center mb-6">
            {!collapsed && <h1 className="text-lg font-bold">Admin</h1>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white hover:text-gray-300"
            >
              {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
            </button>
          </div>

          {/* Nav Menu */}
          <nav className="flex flex-col gap-2">
            {adminNav.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined} // tampilkan tooltip saat collapse
                  className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-800 transition-colors duration-200 ${
                    isActive ? "bg-blue-800 font-semibold" : ""
                  }`}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
