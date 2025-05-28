export default function Footer() {
  return (
    <footer className="text-center text-sm py-6 text-gray-500 bg-white border-t">
      © {new Date().getFullYear()} Invoice Management App. All rights reserved.
    </footer>
  );
}
