import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Credentials {
  hasCitizenCredential: boolean;
  hasPropertyCredential: boolean;
  propertyCount: number;
}

export const useAuth = () => {
  const { publicKey } = useWallet();
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      fetch(`/api/auth/permissions/${publicKey.toString()}`)
        .then(res => res.json())
        .then(data => {
          setCredentials(data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch credentials:', err);
          setLoading(false);
        });
    } else {
      setCredentials(null);
    }
  }, [publicKey]);

  return { credentials, loading };
};