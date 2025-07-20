// src/web/src/hooks/useCredentialRequest.ts
import { useState } from 'react';
import { TwattestSDK } from '../../twattest-sdk';

const sdk = new TwattestSDK({
  baseUrl: 'https://twattest.ddns.net/api'
});

export const useCredentialRequest = () => {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const requestCredential = async (
    credentialType: 'CitizenCredential' | 'PropertyCredential',
    requiredFields: string[],
    purpose: string
  ) => {
    setLoading(true);
    try {
      const session = await sdk.requestData({
        credentialType,
        requiredFields,
        purpose,
        dappDomain: 'zuvi.ddns.net'
      });

      const qrCodeData = await sdk.generateQRCode(session.vpRequestUri);
      
      setQrCode(qrCodeData);
      setRequestId(session.requestId);
      setLoading(false);

      return pollForResult(session.requestId);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('憑證請求失敗');
    }
  };

  const pollForResult = async (requestId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`/api/sdk/data/${requestId}`);
      const data = await response.json();

      if (data.status === 'completed') {
        return data.extractedData;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('憑證請求逾時');
  };

  return {
    loading,
    qrCode,
    requestId,
    requestCredential
  };
};