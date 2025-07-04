
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
  targetRole?: 'parent' | 'teacher' | 'admin' | 'all';
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

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'fee_request',
    title: 'Fee Payment Due',
    message: 'Monthly fee payment for January 2024 is due on 31st January',
    createdAt: '2024-01-15T10:00:00Z',
    read: false,
    priority: 'high',
    targetRole: 'parent'
  },
  {
    id: '2', 
    type: 'announcement',
    title: 'School Closed Tomorrow',
    message: 'Due to weather conditions, school will be closed tomorrow.',
    createdAt: '2024-01-14T08:00:00Z',
    read: false,
    priority: 'high',
    targetRole: 'all',
    createdBy: 'Admin'
  },
  {
    id: '3',
    type: 'event',
    title: 'Parent-Teacher Meeting',
    message: 'Parent-teacher meeting scheduled for next week',
    createdAt: '2024-01-13T15:30:00Z',
    read: true,
    priority: 'medium',
    targetRole: 'parent'
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      // Filter notifications based on user role
      const userNotifications = mockNotifications.filter(notification => 
        notification.targetRole === 'all' || 
        notification.targetRole === user.role ||
        !notification.targetRole
      );
      setNotifications(userNotifications);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification
    }}>
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
