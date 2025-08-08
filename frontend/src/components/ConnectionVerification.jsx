import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Globe, Server, Clock, Shield } from 'lucide-react';
import { connectionCheck } from '../lib/api';
import api from '../lib/api';

export const ConnectionVerification = () => {
  const [verificationResults, setVerificationResults] = useState({
    apiBaseUrl: '',
    healthCheck: null,
    requestId: '',
    securityHeaders: {},
    responseTime: 0,
    backendEnvironment: '',
    timestamp: '',
    isRailway: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const performVerification = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const startTime = Date.now();
      
      // 1. ตรวจสอบ API base URL
      const apiUrl = api.defaults.baseURL;
      
      // 2. เรียก health check API
      const response = await fetch(`${apiUrl}/health` || `${apiUrl}/`);
      const responseTime = Date.now() - startTime;
      
      // 3. ดึง headers
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      // 4. ดึงข้อมูล response
      let healthData = {};
      try {
        const responseText = await response.text();
        if (responseText) {
          healthData = JSON.parse(responseText);
        }
      } catch (e) {
        // ถ้า parse ไม่ได้ ใช้ response status
        healthData = { 
          status: response.ok ? 'healthy' : 'error',
          message: `HTTP ${response.status} ${response.statusText}`
        };
      }
      
      // 5. ตรวจสอบว่าเป็น Railway หรือไม่
      const isRailway = apiUrl.includes('railway.app') || 
                       apiUrl.includes('web-production-5b6ab.up.railway.app');
      
      setVerificationResults({
        apiBaseUrl: apiUrl,
        healthCheck: healthData,
        requestId: headers['x-request-id'] || 'N/A',
        securityHeaders: {
          'Content-Security-Policy': headers['content-security-policy'] || 'Not Set',
          'X-Frame-Options': headers['x-frame-options'] || 'Not Set',
          'Strict-Transport-Security': headers['strict-transport-security'] || 'Not Set',
          'X-Content-Type-Options': headers['x-content-type-options'] || 'Not Set'
        },
        responseTime,
        backendEnvironment: healthData.environment || 'Unknown',
        timestamp: new Date().toISOString(),
        isRailway
      });
      
    } catch (err) {
      console.error('Verification failed:', err);
      setError(`Failed to connect: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performVerification();
  }, []);

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔗 Backend Connection Verification</h1>
          <p className="text-gray-600 mt-2">
            พิสูจน์การเชื่อมต่อ Railway Backend API
          </p>
        </div>
        <Button onClick={performVerification} disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Refresh Verification'}
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>API Connection</span>
            </CardTitle>
            <CardDescription>Backend API endpoint information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Base URL</label>
              <div className="mt-1 p-2 bg-gray-50 rounded font-mono text-sm break-all">
                {verificationResults.apiBaseUrl}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {verificationResults.isRailway ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge className="bg-green-100 text-green-800">Railway Backend</Badge>
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 text-blue-500" />
                    <Badge className="bg-blue-100 text-blue-800">Local Backend</Badge>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Response Time</label>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-lg font-semibold">
                  {formatTime(verificationResults.responseTime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Check Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Health Check</span>
            </CardTitle>
            <CardDescription>Backend server health status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationResults.healthCheck && (
              <>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`${getStatusColor(verificationResults.healthCheck.status)} text-white border-0`}
                  >
                    {verificationResults.healthCheck.status || 'Unknown'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {verificationResults.healthCheck.message || 'No message'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Environment:</span>
                    <span className="ml-2 text-gray-600">
                      {verificationResults.backendEnvironment}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Version:</span>
                    <span className="ml-2 text-gray-600">
                      {verificationResults.healthCheck.version || 'N/A'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Database:</span>
                    <span className="ml-2 text-gray-600">
                      {verificationResults.healthCheck.database || 'N/A'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Request Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Phase 3 Features</span>
            </CardTitle>
            <CardDescription>Security and tracking features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Request ID</label>
              <div className="mt-1 p-2 bg-gray-50 rounded font-mono text-xs break-all">
                {verificationResults.requestId}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {verificationResults.requestId !== 'N/A' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-700">Request tracking active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-700">No request tracking</span>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Timestamp</label>
              <div className="mt-1 text-sm text-gray-600">
                {new Date(verificationResults.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Headers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Headers</span>
            </CardTitle>
            <CardDescription>HTTP security headers verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(verificationResults.securityHeaders).map(([header, value]) => (
                <div key={header} className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {header}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {value}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {value !== 'Not Set' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Railway Proof */}
      {verificationResults.isRailway && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ Railway Connection Verified!</strong>
            <br />
            Frontend is successfully connected to Railway backend at:
            <br />
            <code className="bg-green-100 px-2 py-1 rounded text-sm">
              {verificationResults.apiBaseUrl}
            </code>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
