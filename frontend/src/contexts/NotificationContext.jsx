import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, getAuthToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Load notifications when user changes
  useEffect(() => {
    if (user && ['superadmin', 'system_admin'].includes(user.role)) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      if (!user || !['superadmin', 'system_admin'].includes(user.role)) return;

      setLoading(true);
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE}/api/notifications`, { headers });
      const notifs = response.data;
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read_at).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API_BASE}/api/notifications/${notificationId}/read`, {}, { headers });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API_BASE}/api/notifications/mark-all-read`, {}, { headers });
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API_BASE}/api/notifications/${notificationId}`, { headers });
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Add notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read_at) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    loadNotifications();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    refreshNotifications,
    loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
