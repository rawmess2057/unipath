import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-6" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
