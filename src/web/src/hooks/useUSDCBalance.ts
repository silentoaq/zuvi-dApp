import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const USDC_DECIMALS = 6;

export const useUSDCBalance = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!publicKey || !connection) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenAccountAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey
      );

      const tokenAccount = await getAccount(
        connection,
        tokenAccountAddress
      );

      const usdcBalance = Number(tokenAccount.amount) / Math.pow(10, USDC_DECIMALS);
      setBalance(usdcBalance);
    } catch (err) {
      if (err instanceof Error && err.message.includes('could not find account')) {
        setBalance(0);
      } else {
        console.error('Error fetching USDC balance:', err);
        setError('無法獲取 USDC 餘額');
        setBalance(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [publicKey, connection]);

  useEffect(() => {
    if (!publicKey || !connection) return;

    const subscriptionId = connection.onAccountChange(
      publicKey,
      () => {
        fetchBalance();
      },
      'confirmed'
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  };
};