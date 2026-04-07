import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { BuyerAuth } from './types';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Notifications from './pages/Notifications';

function RequireBuyer({ user, children }: { user: BuyerAuth | null; children: React.ReactNode }) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<BuyerAuth | null>(null);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />} />

      <Route element={<Layout user={user} onLogout={() => setUser(null)} />}>
        <Route index element={user ? <Dashboard user={user} /> : <Home />} />
        <Route path="catalogue" element={<Catalogue user={user} />} />
        <Route path="catalogue/:id" element={<ProductDetail user={user} />} />
        <Route path="orders" element={<RequireBuyer user={user}><Orders user={user!} /></RequireBuyer>} />
        <Route path="orders/:id" element={<RequireBuyer user={user}><OrderDetail /></RequireBuyer>} />
        <Route path="notifications" element={<RequireBuyer user={user}><Notifications user={user!} /></RequireBuyer>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
