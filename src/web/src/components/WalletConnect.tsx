import { useState } from 'react'; 
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCredentialRequest } from '@/hooks/useCredentialRequest';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const WalletConnect = () => {
  const { connected } = useWallet();
  const { credentials } = useAuth();
  const { qrCode, requestCredential } = useCredentialRequest();
  const [showQR, setShowQR] = useState(false);

  const handleConnect = async () => {
    if (!connected) return;

    if (!credentials?.hasCitizenCredential && !credentials?.hasPropertyCredential) {
      setShowQR(true);
      
      try {
        const data = await requestCredential(
          'CitizenCredential',
          ['fullname', 'birthdate'],
          '租房平台身份驗證'
        );
        
        console.log('憑證資料:', data);
        setShowQR(false);
        
        window.location.reload();
      } catch (error) {
        console.error('憑證請求失敗:', error);
        setShowQR(false);
      }
    }
  };

  return (
    <>
      <Button onClick={handleConnect}>
        {connected ? '驗證身份' : '連接錢包'}
      </Button>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent>
          <h3 className="text-lg font-semibold mb-4">請使用錢包掃描 QR Code</h3>
          {qrCode && (
            <div className="flex justify-center">
              <img src={qrCode} alt="Credential Request QR" className="w-64 h-64" />
            </div>
          )}
          <p className="text-center text-sm text-gray-600 mt-4">
            掃描後請在錢包中確認授權
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};