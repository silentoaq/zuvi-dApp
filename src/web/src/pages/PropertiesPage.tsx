import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

export const PropertiesPage: React.FC = () => {
  const { publicKey } = useWallet();
  const { credentials } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('available');

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getListings(statusFilter);
      if (response.success) {
        setListings(response.data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            房源市場
          </h1>
          
          {/* 篩選器 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="available">可租賃</option>
            <option value="rented">已出租</option>
            <option value="">全部</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.pubkey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                {listing.propertyDetails?.images?.[0] && (
                  <img 
                    src={listing.propertyDetails.images[0]} 
                    alt={listing.propertyDetails.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {listing.propertyDetails?.title || listing.propertyId}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  月租: {(parseInt(listing.monthlyRent) / 1000000).toFixed(0)} USDC
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  押金: {listing.depositMonths} 個月
                </p>
                <button 
                  className={`mt-4 w-full py-2 px-4 rounded transition-colors ${
                    publicKey && credentials?.hasCitizenCredential
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!publicKey || !credentials?.hasCitizenCredential}
                  onClick={() => window.location.href = `/property/${listing.propertyId}`}
                >
                  {!publicKey ? '請先連接錢包' : 
                   !credentials?.hasCitizenCredential ? '需要自然人憑證' : 
                   '查看詳情'}
                </button>
              </div>
            ))}
          </div>
        )}
        
        {!loading && listings.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              目前沒有符合條件的房源
            </p>
          </div>
        )}
      </div>
    </div>
  );
};