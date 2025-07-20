import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { TwattestSDK } from '../../twattest-sdk';
import type { UserPermissions, AttestationStatus } from '../../twattest-sdk';

const sdk = new TwattestSDK({
  baseUrl: 'https://twattest.ddns.net/api'
});

const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const USDC_DECIMALS = 6;

interface AuthContextType {
  credentials: UserPermissions | null;
  attestationStatus: AttestationStatus | null;
  balance: number;
  loading: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [credentials, setCredentials] = useState<UserPermissions | null>(null);
  const [attestationStatus, setAttestationStatus] = useState<AttestationStatus | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    if (!publicKey) {
      setCredentials(null);
      setAttestationStatus(null);
      return;
    }

    try {
      const did = publicKey.toString();
      const [permissions, attestation] = await Promise.all([
        sdk.checkPermissions(did),
        sdk.getAttestationStatus(did)
      ]);

      setCredentials(permissions);
      setAttestationStatus(attestation);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '驗證失敗');
      setCredentials(null);
      setAttestationStatus(null);
    }
  };

  const checkBalance = async () => {
    if (!publicKey || !connection) {
      setBalance(0);
      return;
    }

    try {
      const tokenAccountAddress = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const tokenAccount = await getAccount(connection, tokenAccountAddress);
      const usdcBalance = Number(tokenAccount.amount) / Math.pow(10, USDC_DECIMALS);
      setBalance(usdcBalance);
    } catch (err) {
      if (err instanceof Error && err.message.includes('could not find account')) {
        setBalance(0);
      } else {
        console.error('Error fetching USDC balance:', err);
        setBalance(0);
      }
    }
  };

  const refreshAll = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    await Promise.all([checkAuth(), checkBalance()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [publicKey, connection]);

  useEffect(() => {
    if (!publicKey || !connection) return;

    const subscriptionId = connection.onAccountChange(
      publicKey,
      () => {
        checkBalance();
      },
      'confirmed'
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  return (
    <AuthContext.Provider value={{ 
      credentials, 
      attestationStatus, 
      balance,
      loading, 
      error,
      refreshAuth: checkAuth,
      refreshBalance: checkBalance,
      refreshAll
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};