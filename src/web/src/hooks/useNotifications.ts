import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Notification {
  id: string;
  type: 'application' | 'payment' | 'contract' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export const useNotifications = () => {
  const { publicKey } = useWallet();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      // TODO: Replace with actual API call
      // Mock data for now
      setNotifications([
        {
          id: '1',
          type: 'application',
          title: '新的租房申請',
          message: '您有一個新的租房申請待處理',
          timestamp: Date.now(),
          read: false
        }
      ]);
    } else {
      setNotifications([]);
    }
  }, [publicKey]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, loading, markAsRead, unreadCount };
};