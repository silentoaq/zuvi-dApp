import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, X, Home, FileText, Briefcase, PlusCircle, LogOut, Copy } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

interface Credentials {
  hasCitizenCredential: boolean;
  hasPropertyCredential: boolean;
  propertyCount: number;
}

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, disconnect } = useWallet();
  const { credentials, loading: authLoading } = useAuth();
  const { notifications } = useNotifications();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Fetch USDC balance
  useEffect(() => {
    if (publicKey) {
      // TODO: Fetch actual USDC balance
      setBalance(1250.50); // Mock value
    }
  }, [publicKey]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletMenu(false);
    navigate('/');
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      // TODO: Show toast notification
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Navigation items
  const navItems = [
    { name: '房源市場', icon: Home, path: '/properties' },
    { name: '我的申請', icon: FileText, path: '/applications' },
    { name: '我的合約', icon: Briefcase, path: '/contracts' },
  ];

  // Conditionally add '發布管理' if user has property credentials
  if (credentials?.hasPropertyCredential) {
    navItems.push({ name: '發布管理', icon: PlusCircle, path: '/listings' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                Zuvi
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Right side tools */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Credentials Status - Desktop */}
              {publicKey && !authLoading && (
                <div className="hidden md:flex items-center space-x-2">
                  {credentials?.hasPropertyCredential && (
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      🏠 {credentials.propertyCount}
                    </span>
                  )}
                  {credentials?.hasCitizenCredential && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">👤</span>
                  )}
                </div>
              )}

              {/* Wallet Info */}
              {publicKey ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
                      {formatAddress(publicKey.toString())}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {balance.toFixed(2)} USDC
                    </span>
                  </button>

                  {/* Wallet Dropdown */}
                  {showWalletMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Wallet</span>
                          <button
                            onClick={copyAddress}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mb-3 break-all">
                          {publicKey.toString()}
                        </p>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            餘額: {balance.toFixed(2)} USDC
                          </p>
                          <button
                            onClick={handleDisconnect}
                            className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>斷開連接</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/connect')}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  連接錢包
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-400"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
              
              {/* Mobile Credentials */}
              {publicKey && credentials && (
                <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>憑證狀態:</span>
                  {credentials.hasPropertyCredential && (
                    <span>🏠 {credentials.propertyCount}</span>
                  )}
                  {credentials.hasCitizenCredential && <span>👤</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 Zuvi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;