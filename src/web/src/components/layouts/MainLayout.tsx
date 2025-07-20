import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, X, Home, FileText, Briefcase, PlusCircle, LogOut, Copy, User, Building } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';


const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { credentials, balance, loading } = useAuth();
  const { notifications } = useNotifications();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

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
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // 固定導航項目 - 不根據憑證狀態改變
  const navItems = [
    { name: '房源市場', icon: Home, path: '/properties' },
    { name: '我的申請', icon: FileText, path: '/applications' },
    { name: '我的合約', icon: Briefcase, path: '/contracts' },
    { name: '發布管理', icon: PlusCircle, path: '/listings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
                onClick={() => navigate('/')}
              >
                Zuvi
              </h1>

              <nav className="hidden md:flex items-center space-x-1 ml-10">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {publicKey && (
                <div className="hidden md:flex items-center">
                  <div
                    className="group relative flex items-center space-x-1 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-help"
                    title="憑證狀態"
                  >
                    <User className={`w-4 h-4 ${credentials?.hasCitizenCredential
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                      }`} />

                    <Building className={`w-4 h-4 ${credentials?.hasPropertyCredential
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    <span className={`text-sm font-medium ${credentials?.hasPropertyCredential
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400 dark:text-gray-500'
                      }`}>
                      {credentials?.propertyCount || 0}
                    </span>

                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3" />
                            <span>{credentials?.hasCitizenCredential ? '自然人憑證已驗證' : '自然人憑證未驗證'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-3 h-3" />
                            <span>{credentials?.hasPropertyCredential
                              ? `擁有 ${credentials.propertyCount} 個房產憑證`
                              : '房產憑證未驗證'}</span>
                          </div>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {publicKey ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <span>{formatAddress(publicKey.toString())}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {loading ? '...' : `${balance.toFixed(2)} USDC`}
                    </span>
                  </button>

                  {showWalletMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <button
                        onClick={copyAddress}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        複製地址
                      </button>
                      <hr className="border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        斷開連接
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setVisible(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  連接錢包
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              ))}

              {/* Mobile Credentials */}
              {publicKey && (
                <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      我的憑證
                    </span>
                    <div className="flex items-center space-x-3">
                      <User className={`w-4 h-4 ${credentials?.hasCitizenCredential
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      <Building className={`w-4 h-4 ${credentials?.hasPropertyCredential
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      <span className={`text-sm font-medium ${credentials?.hasPropertyCredential
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                        }`}>
                        {credentials?.propertyCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

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