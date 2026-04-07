import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import type { BuyerAuth } from '../types';

interface Props {
  user: BuyerAuth | null;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: Props) {
  const location = useLocation();
  const noFooter = ['/login'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen w-full bg-stone-50">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}
