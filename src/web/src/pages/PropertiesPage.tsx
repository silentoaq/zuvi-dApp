import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';

export const PropertiesPage: React.FC = () => {
  const { publicKey } = useWallet();
  const { credentials } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          房源市場
        </h1>

        {/* 模擬房源列表 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <h3 className="font-medium text-gray-900 dark:text-white">房源 {i}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">月租: 15,000 USDC</p>
              <button 
                className={`mt-4 w-full py-2 px-4 rounded transition-colors ${
                  publicKey && credentials?.hasCitizenCredential
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!publicKey || !credentials?.hasCitizenCredential}
              >
                {!publicKey ? '請先連接錢包' : 
                 !credentials?.hasCitizenCredential ? '需要自然人憑證' : 
                 '申請租賃'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};