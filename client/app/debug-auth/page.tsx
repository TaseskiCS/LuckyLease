'use client';

import { useState, useEffect } from 'react';
import { getUserInfo, isLoggedIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function DebugAuthPage() {
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Get all localStorage data
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = localStorage.getItem(key);
        } catch (error) {
          data[key] = 'Error reading';
        }
      }
    }
    setLocalStorageData(data);

    // Get user info
    const info = getUserInfo();
    setUserInfo(info);
    setLoggedIn(isLoggedIn());
  }, []);

  const handleFixUserInfo = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        const newUserInfo = {
          id: user.id,
          token: token
        };
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
        alert('Fixed! Please refresh the page.');
        window.location.reload();
      } catch (error) {
        alert('Error fixing user info: ' + error);
      }
    } else {
      alert('No token or user data found');
    }
  };

  const handleClearAll = () => {
    localStorage.clear();
    alert('Cleared all localStorage. Please refresh.');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current State */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-2">
              <p><strong>isLoggedIn():</strong> {loggedIn ? '✅ True' : '❌ False'}</p>
              <p><strong>getUserInfo():</strong> {userInfo ? '✅ Found' : '❌ Not found'}</p>
              {userInfo && (
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>User ID:</strong> {userInfo.id}</p>
                  <p><strong>Token:</strong> {userInfo.token ? 'Present' : 'Missing'}</p>
                </div>
              )}
            </div>
          </div>

          {/* localStorage Contents */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">localStorage Contents</h2>
            <div className="space-y-2">
              {Object.keys(localStorageData).length === 0 ? (
                <p className="text-gray-500">No data in localStorage</p>
              ) : (
                Object.entries(localStorageData).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <p><strong>{key}:</strong></p>
                    <p className="text-sm text-gray-600 break-all">{String(value)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <Button onClick={handleFixUserInfo} className="bg-blue-600 hover:bg-blue-700">
              Fix User Info (Convert old format)
            </Button>
            <Button onClick={handleClearAll} className="bg-red-600 hover:bg-red-700">
              Clear All localStorage
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-gray-600 hover:bg-gray-700">
              Refresh Page
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Instructions</h2>
          <div className="text-blue-700 space-y-2">
            <p>1. Check if you see any user data in localStorage</p>
            <p>2. If you see "token" and "user" but no "userInfo", click "Fix User Info"</p>
            <p>3. If nothing works, click "Clear All" and log in again</p>
            <p>4. After fixing, go back to a listing and try "Send Message"</p>
          </div>
        </div>
      </div>
    </div>
  );
} 