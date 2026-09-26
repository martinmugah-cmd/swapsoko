import React, { createContext, useContext, useState, useEffect } from 'react';
import { SwapSokoNotification, SwapSokoEvent, NotificationEngine } from '@/lib/engines/NotificationEngine';

interface NotificationContextType {
  notifications: SwapSokoNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  publishEvent: (event: SwapSokoEvent) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SwapSokoNotification[]>([]);

  const defaultPreferences = {
    offersInApp: true,
    messagesInApp: true,
    multiswapInApp: true,
    recommendationsInApp: true,
    securityInApp: true,
  };

  // Simulate real-time event reception
  const publishEvent = (event: SwapSokoEvent) => {
    // In a real app, this would be a Supabase Realtime subscription receiving a row from `notifications`
    // Since we mock backend, we route the event through the Engine directly here for demo.
    const notif = NotificationEngine.processEvent(event, 'user_martin', defaultPreferences);
    
    if (notif) {
      setNotifications(prev => [notif, ...prev]);
    }
  };

  // Mock initial fetch
  useEffect(() => {
    const mockNotifs: SwapSokoNotification[] = [
      {
         id: 'n1',
         recipientId: 'user_martin',
         type: 'OFFER_ACCEPTED',
         title: 'Offer accepted',
         body: 'John accepted your PS5 offer.',
         severity: 'HIGH',
         isRead: false,
         createdAt: Date.now() - 1000 * 60 * 5 // 5 mins ago
      },
      {
         id: 'n2',
         recipientId: 'user_martin',
         type: 'MULTISWAP_PROPOSED',
         title: 'New multi-swap found',
         body: 'A 3-person cycle could get you that MacBook.',
         severity: 'NORMAL',
         isRead: true,
         createdAt: Date.now() - 1000 * 60 * 60 // 1 hr ago
      }
    ];
    setNotifications(mockNotifs);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, publishEvent }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
