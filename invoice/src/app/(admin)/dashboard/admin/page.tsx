'use client';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-gray-700 font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 text-gray-700 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Clients" value="--" />
        <DashboardCard title="Total Invoices" value="--" />
        <DashboardCard title="Total Revenue" value="--" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white shadow-sm border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
