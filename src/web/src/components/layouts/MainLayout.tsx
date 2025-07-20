import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, X, Home, FileText, Briefcase, PlusCircle, LogOut, Copy, User, Building } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
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

  const navItems = [
    { name: '房源市場', icon: Home, path: '/properties' },
    { name: '我的申請', icon: FileText, path: '/applications' },
    { name: '我的合約', icon: Briefcase, path: '/contracts' },
  ];

  if (credentials?.hasPropertyCredential) {
    navItems.push({ name: '發布管理', icon: PlusCircle, path: '/listings' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 使用 Grid 布局確保精確控制 */}
          <div className="grid grid-cols-3 items-center h-16">
            {/* Logo - 左側 */}
            <div className="flex justify-start">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
              >
                Zuvi
              </button>
            </div>

            {/* Desktop Navigation - 中間 */}
            <nav className="hidden md:flex justify-center">
              <div className="flex space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Right side tools - 右側 */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
              {/* Notifications - 在小螢幕隱藏 */}
              <button
                onClick={() => navigate('/notifications')}
                className="hidden sm:block relative p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Theme Toggle - 在小螢幕隱藏 */}
              <button
                onClick={toggleTheme}
                className="hidden sm:block p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Credentials Status - Desktop */}
              {publicKey && !authLoading && (credentials?.hasCitizenCredential || credentials?.hasPropertyCredential) && (
                <div className="hidden md:flex items-center">
                  <div
                    className="group relative flex items-center space-x-1 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-help"
                    title="已驗證憑證"
                  >
                    {credentials?.hasCitizenCredential && (
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                    {credentials?.hasPropertyCredential && (
                      <>
                        <Building className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {credentials.propertyCount}
                        </span>
                      </>
                    )}

                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          {credentials?.hasCitizenCredential && (
                            <div className="flex items-center space-x-2">
                              <User className="w-3 h-3" />
                              <span>自然人憑證已驗證</span>
                            </div>
                          )}
                          {credentials?.hasPropertyCredential && (
                            <div className="flex items-center space-x-2">
                              <Building className="w-3 h-3" />
                              <span>擁有 {credentials.propertyCount} 個房產憑證</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Info */}
              {publicKey ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="font-medium hidden sm:inline">{formatAddress(publicKey.toString())}</span>
                    <span className="font-medium sm:hidden">已連接</span>
                    {balance > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:inline">
                        ${balance.toFixed(2)}
                      </span>
                    )}
                  </button>

                  {/* Wallet Dropdown */}
                  {showWalletMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">錢包地址</p>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs font-mono flex-1 truncate">
                              {publicKey.toString()}
                            </code>
                            <button
                              onClick={copyAddress}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {balance > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">USDC 餘額</p>
                            <p className="text-lg font-semibold">${balance.toFixed(2)}</p>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
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
                  onClick={() => setVisible(true)}
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap"
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
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">憑證：</span>
                    {credentials.hasCitizenCredential && (
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                    {credentials.hasPropertyCredential && (
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{credentials.propertyCount}</span>
                      </div>
                    )}
                  </div>
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