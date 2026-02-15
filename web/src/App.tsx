import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import ProxySettings from './pages/ProxySettings';
import { LoginDialog } from './components/auth/LoginDialog';
import { authApi } from './lib/api';

export default function App() {
  const [authRequired, setAuthRequired] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-required', () => setShowLogin(true));
  }, []);

  const checkAuth = async () => {
    try {
      const result = await authApi.check();
      setAuthRequired(result.required);
      if (result.required && !localStorage.getItem('auth_token')) {
        setShowLogin(true);
      }
    } catch {
      // 忽略错误
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      {authRequired && <LoginDialog open={showLogin} onSuccess={() => setShowLogin(false)} />}
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/proxy" element={<ProxySettings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
