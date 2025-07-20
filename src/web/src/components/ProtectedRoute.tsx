import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCitizen?: boolean;
  requireProperty?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireCitizen = false,
  requireProperty = false 
}) => {
  const { publicKey } = useWallet();
  const { credentials, loading } = useAuth();
  const location = useLocation();

  // 載入中顯示 loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">驗證憑證中...</p>
        </div>
      </div>
    );
  }

  // 未連接錢包
  if (!publicKey) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            請先連接錢包
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            您需要連接錢包才能訪問此頁面
          </p>
          <Navigate to="/" state={{ from: location }} replace />
        </div>
      </div>
    );
  }

  // 需要自然人憑證但沒有
  if (requireCitizen && !credentials?.hasCitizenCredential) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            需要自然人憑證
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            您需要驗證自然人憑證才能訪問此頁面
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // 需要產權憑證但沒有
  if (requireProperty && !credentials?.hasPropertyCredential) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            需要產權憑證
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            您需要擁有產權憑證才能訪問此頁面
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // 權限檢查通過
  return <>{children}</>;
};