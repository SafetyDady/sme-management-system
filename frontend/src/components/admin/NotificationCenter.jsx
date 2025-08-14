import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck,
  Users, 
  UserPlus,
  Mail,
  Calendar,
  Filter,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const NotificationCenter = () => {
  const { user, getAuthToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user?.role && ['superadmin', 'system_admin'].includes(user.role)) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE}/api/notifications`, { headers });
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Load notifications error:', err);
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
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const unreadNotifications = notifications.filter(n => !n.read_at);
      
      await Promise.all(
        unreadNotifications.map(n => 
          axios.put(`${API_BASE}/api/notifications/${n.id}/read`, {}, { headers })
        )
      );

      loadNotifications();
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${API_BASE}/api/notifications/${notificationId}`, { headers });
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'employee_added': <Users className="h-5 w-5 text-blue-500" />,
      'user_assigned': <UserPlus className="h-5 w-5 text-green-500" />,
      'assignment_request': <Bell className="h-5 w-5 text-orange-500" />,
      'system_alert': <BellRing className="h-5 w-5 text-red-500" />
    };
    return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      'employee_added': 'bg-blue-100 text-blue-800',
      'user_assigned': 'bg-green-100 text-green-800',
      'assignment_request': 'bg-orange-100 text-orange-800',
      'system_alert': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'unread' && !notification.read_at) ||
      (filterStatus === 'read' && notification.read_at);
    
    return matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Notification Center</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button onClick={loadNotifications} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Type</label>
              <select 
                className="px-3 py-2 border rounded"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="employee_added">Employee Added</option>
                <option value="user_assigned">User Assigned</option>
                <option value="assignment_request">Assignment Request</option>
                <option value="system_alert">System Alert</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Status</label>
              <select 
                className="px-3 py-2 border rounded"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Notifications</p>
                <p className="text-xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BellRing className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCheck className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-xl font-bold">{notifications.length - unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Employee Alerts</p>
                <p className="text-xl font-bold">
                  {notifications.filter(n => ['employee_added', 'user_assigned'].includes(n.type)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {filterType !== 'all' || filterStatus !== 'all' 
                  ? 'No notifications match the current filters'
                  : 'No notifications yet'
                }
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 transition-all ${
                    !notification.read_at 
                      ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Icon */}
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <Badge className={getTypeBadgeColor(notification.type)}>
                            {notification.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {!notification.read_at && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          
                          {notification.read_at && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="h-3 w-3" />
                              Read {new Date(notification.read_at).toLocaleString()}
                            </span>
                          )}
                          
                          {notification.data?.employee_name && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {notification.data.employee_name}
                            </span>
                          )}
                        </div>

                        {/* Additional data */}
                        {notification.data && Object.keys(notification.data).length > 1 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-600">
                              {notification.data.department && (
                                <span className="mr-4">
                                  <strong>Department:</strong> {notification.data.department}
                                </span>
                              )}
                              {notification.data.position && (
                                <span className="mr-4">
                                  <strong>Position:</strong> {notification.data.position}
                                </span>
                              )}
                              {notification.data.emp_code && (
                                <span>
                                  <strong>Employee ID:</strong> {notification.data.emp_code}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-3">
                      {!notification.read_at && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
