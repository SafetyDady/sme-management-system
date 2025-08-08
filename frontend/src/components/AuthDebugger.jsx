import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash2, RefreshCw } from 'lucide-react';

const AuthDebugger = () => {
  const clearAllAuth = () => {
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.log('🧹 All auth data cleared!');
    
    // Force reload
    window.location.href = '/login';
  };

  const checkAuthStatus = () => {
    const cookies = document.cookie;
    const hasAuthToken = cookies.includes('auth_token');
    const hasUserData = cookies.includes('user_data');
    
    console.log('🔍 Auth Status Check:');
    console.log('- Has auth_token:', hasAuthToken);
    console.log('- Has user_data:', hasUserData);
    console.log('- All cookies:', cookies);
    console.log('- localStorage:', localStorage);
    console.log('- sessionStorage:', sessionStorage);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Auth Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Clear all authentication data and cookies
        </p>
        
        <div className="space-y-2">
          <Button
            onClick={checkAuthStatus}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Auth Status
          </Button>
          
          <Button
            onClick={clearAllAuth}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All & Restart
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t">
          This will clear all cookies, localStorage, and sessionStorage
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;
