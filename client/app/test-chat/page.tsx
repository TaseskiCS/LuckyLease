'use client';

import { useState, useEffect } from 'react';
import { Chat } from '@/components/ui/chat';
import { Button } from '@/components/ui/button';
import { getUserInfo } from '@/lib/auth';

export default function TestChatPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; token: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Get current user info using the utility function
    const userInfo = getUserInfo();
    if (userInfo) {
      setCurrentUser(userInfo);
      console.log('Test page - User loaded:', userInfo);
    } else {
      console.log('Test page - No user info found');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat Test Page</h1>
        
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2">
            <p><strong>User Logged In:</strong> {currentUser ? 'Yes' : 'No'}</p>
            {currentUser && (
              <>
                <p><strong>User ID:</strong> {currentUser.id}</p>
                <p><strong>Token:</strong> {currentUser.token ? 'Present' : 'Missing'}</p>
              </>
            )}
            <p><strong>Chat Open:</strong> {isChatOpen ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            {!currentUser ? (
              <div className="p-4 bg-yellow-100 rounded-lg">
                <p className="text-yellow-800">Please log in first to test the chat functionality.</p>
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="mt-2"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  onClick={() => setIsChatOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Open Chat
                </Button>
                
                <div className="p-4 bg-blue-100 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Instructions:</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 text-blue-700">
                    <li>Click "Open Chat" to test the chat interface</li>
                    <li>Check the browser console for debug logs</li>
                    <li>Try sending a message to test the socket connection</li>
                    <li>Look for any error messages in the console</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {isChatOpen && currentUser && (
        <Chat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUserId={currentUser.id}
          token={currentUser.token}
        />
      )}
    </div>
  );
} 