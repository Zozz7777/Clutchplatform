import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  ClipboardDocumentListIcon, 
  CubeIcon, 
  ChartBarIcon, 
  CogIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, partnerId: _partnerId } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: t('common.dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('pos.title'), href: '/pos', icon: ShoppingCartIcon },
    { name: t('orders.title'), href: '/orders', icon: ClipboardDocumentListIcon },
    { name: t('inventory.title'), href: '/inventory', icon: CubeIcon },
    { name: t('reports.title'), href: '/reports', icon: ChartBarIcon },
    { name: t('common.settings'), href: '/settings', icon: CogIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-border">
            <img 
              src="/assets/logos/logo-red.png" 
              alt="Clutch Partners" 
              className="h-8"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-sidebar-primary text-white'
                      : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-2 text-xl font-semibold text-foreground">
                {navigation.find(item => isActive(item.href))?.name || t('common.dashboard')}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sync status */}
              <div className="flex items-center text-sm text-muted-foreground">
                <WifiIcon className="w-4 h-4 mr-1" />
                <span>متصل</span>
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-muted relative">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </button>

              {/* Language toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-sm"
              >
                {i18n.language === 'ar' ? 'EN' : 'عربي'}
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
