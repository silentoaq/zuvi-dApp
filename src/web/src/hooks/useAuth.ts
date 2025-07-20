import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TwattestSDK } from '../../twattest-sdk';

import type { UserPermissions, AttestationStatus } from '../../twattest-sdk';

type Credentials = UserPermissions;

const sdk = new TwattestSDK({
  baseUrl: 'https://twattest.ddns.net/api'
});

interface AuthState {
  credentials: Credentials | null;
  attestationStatus: AttestationStatus | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const { publicKey } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({
    credentials: null,
    attestationStatus: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (publicKey) {
      const did = publicKey.toString();
      checkUserAuth(did);
      
      // 每30秒更新一次
      const interval = setInterval(() => {
        checkUserAuth(did);
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setAuthState({
        credentials: null,
        attestationStatus: null,
        loading: false,
        error: null
      });
    }
  }, [publicKey]);

  const checkUserAuth = async (did: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const permissions = await sdk.checkPermissions(did);
      const attestationStatus = await sdk.getAttestationStatus(did);
      
      setAuthState({
        credentials: permissions,
        attestationStatus,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      setAuthState({
        credentials: null,
        attestationStatus: null,
        loading: false,
        error: errorMessage
      });
    }
  };

  return authState;
};