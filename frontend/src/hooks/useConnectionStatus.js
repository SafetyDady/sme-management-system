import { useState, useEffect } from 'react';
import { connectionCheck } from '../lib/api';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiUrl, setApiUrl] = useState('');

  const checkConnection = async () => {
    setBackendStatus('checking');
    
    try {
      // Try a simple endpoint that should always work (like getting auth info)
      const result = await connectionCheck.checkBackendHealth();
      
      if (result.success) {
        setBackendStatus('connected');
        setIsOnline(true);
      } else {
        setBackendStatus('disconnected');
        // Try switching to Railway if local server fails
        if (import.meta.env.DEV && result.isTimeout) {
          console.log('Local server timeout, switching to Railway...');
          connectionCheck.switchToRailway();
          
          // Check Railway connection
          const railwayResult = await connectionCheck.checkBackendHealth();
          if (railwayResult.success) {
            setBackendStatus('connected-railway');
          }
        }
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setBackendStatus('error');
    }
  };

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnection();
    
    // Reduce frequency to avoid spam - check every 2 minutes instead of 30 seconds
    const interval = setInterval(checkConnection, 120000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setBackendStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const reconnect = () => {
    checkConnection();
  };

  const switchToLocal = () => {
    connectionCheck.switchToLocal();
    checkConnection();
  };

  const switchToRailway = () => {
    connectionCheck.switchToRailway();
    checkConnection();
  };

  return {
    isOnline,
    backendStatus,
    reconnect,
    switchToLocal,
    switchToRailway,
    checkConnection,
  };
};
