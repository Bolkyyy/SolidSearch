import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { notificationsApi, Notification } from '../api/notifications';
import { session } from '../utils/session';

const getUserId = (): number => {
  const raw = session.getUserId();
  const id = parseInt(raw ?? '', 10);
  return id > 0 ? id : 0;
};

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadNotifications = () => {
    const userId = getUserId();
    if (!userId) return;
    notificationsApi.getAll(userId)
      .then((data) => { setNotifications(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, [location.pathname]);

  useEffect(() => {
    intervalRef.current = setInterval(loadNotifications, 30_000);
    const handleFocus = () => loadNotifications();
    window.addEventListener('focus', handleFocus);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const markAsRead = (id: number) => {
    const userId = getUserId();
    if (!userId) return;
    notificationsApi.markAsRead(id, userId).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }).catch(() => {});
  };

  const markAllAsRead = () => {
    const userId = getUserId();
    if (!userId) return;
    notificationsApi.markAllAsRead(userId).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }).catch(() => {});
  };

  const removeNotification = (id: number) => {
    const userId = getUserId();
    if (!userId) return;
    notificationsApi.remove(id, userId).then(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }).catch(() => {});
  };

  const clearAll = () => {
    const userId = getUserId();
    if (!userId) return;
    notificationsApi.clearAll(userId).then(() => setNotifications([])).catch(() => {});
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationsContext.Provider value={{
      notifications, unreadCount, loading,
      loadNotifications, markAsRead, markAllAsRead, removeNotification, clearAll,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
