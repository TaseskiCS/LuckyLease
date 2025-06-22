'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from './button';
import { Chat } from './chat';
import { Badge } from './badge';

interface ChatButtonProps {
  currentUserId: string;
  token: string;
}

export function ChatButton({ currentUserId, token }: ChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check for unread messages periodically
    const checkUnreadMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const totalUnread = data.conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };

    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Interface */}
      <Chat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUserId={currentUserId}
        token={token}
      />
    </>
  );
} 