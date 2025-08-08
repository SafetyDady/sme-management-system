import React from 'react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Wifi, WifiOff, Server, RefreshCw } from 'lucide-react';

export const ConnectionStatus = () => {
  const { 
    isOnline, 
    backendStatus, 
    reconnect, 
    switchToLocal, 
    switchToRailway,
    checkConnection 
  } = useConnectionStatus();

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connected-railway':
        return 'bg-blue-500';
      case 'checking':
        return 'bg-yellow-500';
      case 'disconnected':
      case 'error':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Local Server';
      case 'connected-railway':
        return 'Railway Server';
      case 'checking':
        return 'Checking...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
        {/* Internet Status */}
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
        </div>

        {/* Backend Status */}
        <div className="flex items-center space-x-1">
          <Server className="h-4 w-4 text-gray-600" />
          <Badge 
            variant="outline" 
            className={`${getStatusColor(backendStatus)} text-white border-0 text-xs`}
          >
            {getStatusText(backendStatus)}
          </Badge>
        </div>

        {/* Reconnect Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={checkConnection}
          className="h-6 w-6 p-0"
          disabled={backendStatus === 'checking'}
        >
          <RefreshCw 
            className={`h-3 w-3 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} 
          />
        </Button>
      </div>

      {/* Connection Controls for Development */}
      {isDevelopment && (backendStatus === 'disconnected' || backendStatus === 'error') && (
        <Alert className="mt-2 max-w-sm">
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm">Backend connection failed</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={switchToLocal}>
                  Try Local
                </Button>
                <Button size="sm" variant="outline" onClick={switchToRailway}>
                  Use Railway
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Alert */}
      {!isOnline && (
        <Alert className="mt-2 max-w-sm bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            No internet connection detected
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
