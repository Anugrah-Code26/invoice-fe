export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-100 flex items-center justify-center min-h-screen">
        <main className="w-full bg-white shadow-md rounded">
          {children}
        </main>
      </body>
    </html>
  );
}
