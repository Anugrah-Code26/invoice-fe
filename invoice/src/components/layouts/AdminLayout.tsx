'use client';

import NavbarAdmin from "@/components/NavbarAdmin";
import axios from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiPackage,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";

const adminNav = [
  { label: "Dashboard", href: "/dashboard/admin", icon: FiHome },
  { label: "My Profile", href: "/profile", icon: FiUsers },
  { label: "Manage Client", href: "/clients", icon: FiUsers },
  { label: "Manage Product", href: "/products", icon: FiPackage },
  { label: "Manage Invoice", href: "/invoices", icon: FiFileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = session?.accessToken;
        if (!token) throw new Error('No access token found');

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(response.data.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile');
      }
    };
    if (session?.accessToken) {
      fetchProfile();
    }
  }, [session]);

  return (
    <div className="flex-col">
      <NavbarAdmin />
      <div className="flex min-h-screen bg-gray-100 text-sm">
        <aside
          className={`bg-blue-900 text-white min-h-screen p-4 space-y-4 flex flex-col transition-[width] duration-300 ease-in-out ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            {!collapsed && <h1 className="text-lg font-bold">{profile?.name}</h1>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white hover:text-gray-300"
            >
              {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {adminNav.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`flex items-center ${!collapsed ? "px-3 py-2 gap-2" : "my-2"} rounded hover:bg-blue-800 transition-colors duration-200 ${
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

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
