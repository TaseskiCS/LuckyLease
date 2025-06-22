'use client';

import { useState, useEffect } from 'react';
import { ChatButton } from './chat-button';

export function ChatProvider() {
  const [currentUser, setCurrentUser] = useState<{ id: string; token: string } | null>(null);

  useEffect(() => {
    // Get current user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }

    // Listen for login/logout events
    const handleStorageChange = () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  if (!currentUser) {
    return null; // Don't show chat button if user is not logged in
  }

  return (
    <ChatButton
      currentUserId={currentUser.id}
      token={currentUser.token}
    />
  );
} 