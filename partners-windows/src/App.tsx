import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './i18n';

// Pages
import PartnerIdPage from './pages/PartnerIdPage';
import DeviceRegistrationPage from './pages/DeviceRegistrationPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t: _t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/partner-id" element={<PartnerIdPage />} />
        <Route path="/device-registration" element={<DeviceRegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/partner-id" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
