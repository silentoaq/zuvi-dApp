import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/hooks/useAuth';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { credentials } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">歡迎來到 Zuvi</h1>
        <p className="text-xl mb-6">基於區塊鏈的安全租房平台</p>
        
        {!publicKey && (
          <p className="text-blue-100">請連接錢包開始使用</p>
        )}
      </div>

      {/* Status Cards */}
      {publicKey && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              錢包狀態
            </h2>
            <p className="text-sm text-green-600 dark:text-green-400">已連接</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              自然人憑證
            </h2>
            <p className={`text-sm ${
              credentials?.hasCitizenCredential 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {credentials?.hasCitizenCredential ? '已驗證' : '未驗證'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              產權憑證
            </h2>
            <p className={`text-sm ${
              credentials?.hasPropertyCredential 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {credentials?.hasPropertyCredential 
                ? `已驗證 (${credentials.propertyCount} 個)` 
                : '未驗證'}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          快速開始
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => navigate('/properties')}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">瀏覽房源</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              查看所有可租賃的房源
            </p>
          </button>

          <button
            onClick={() => navigate('/applications')}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">我的申請</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {credentials?.hasCitizenCredential ? '查看申請狀態' : '需要自然人憑證'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};