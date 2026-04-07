import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import type { AuthUser } from '../../types';

interface Props {
  user: AuthUser | null;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: Props) {
  return (
    <div className="flex w-full h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      <Sidebar user={user} onLogout={onLogout} />
      {/* main fills all remaining space; each page manages its own overflow */}
      <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
