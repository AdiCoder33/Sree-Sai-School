import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'fee_request' | 'announcement' | 'homework' | 'event';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  targetRole?: string;
  createdBy?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = localStorage.getItem('smartschool_token');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Convert backend field to match your Notification type
        const formatted = data.map((n: any) => ({
          ...n,
          createdAt: n.created_at,
          read: n.isRead === 1,
        }));

        setNotifications(formatted);
      } catch (err) {
        console.error('❌ Failed to fetch notifications:', err);
      }
    };

    if (user && token) {
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('❌ Mark as read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:5000/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('❌ Mark all as read error:', err);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    // Optional: Add API DELETE call if needed
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
