'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, X, User, MessageSquare } from 'lucide-react';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Card, CardContent, CardHeader } from './card';
import { Input } from './input';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  timestamp: Date;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Conversation {
  listingId: string;
  listing: {
    id: string;
    title: string;
    imageUrls: string[];
  };
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  token: string;
  initialListingId?: string;
  initialReceiverId?: string;
}

export function Chat({ isOpen, onClose, currentUserId, token, initialListingId, initialReceiverId }: ChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentConversationRef = useRef<string | null>(null);

  console.log('Chat component props:', { 
    isOpen, 
    currentUserId, 
    hasToken: !!token, 
    initialListingId, 
    initialReceiverId 
  });

  useEffect(() => {
    if (isOpen && token) {
      console.log('Initializing chat with token');
      initializeSocket();
      loadConversations();
    }

    return () => {
      if (socket) {
        console.log('Disconnecting socket');
        socket.disconnect();
      }
    };
  }, [isOpen, token]);

  useEffect(() => {
    if (selectedConversation) {
      console.log('Selected conversation changed:', selectedConversation.listingId);
      currentConversationRef.current = selectedConversation.listingId;
      loadMessages(selectedConversation.listingId);
      // Join the room after a short delay to ensure socket is connected
      setTimeout(() => {
        joinListingRoom(selectedConversation.listingId);
      }, 100);
    } else {
      currentConversationRef.current = null;
    }
  }, [selectedConversation]);

  // Handle initial listing context - immediate setup
  useEffect(() => {
    if (isOpen && initialListingId && initialReceiverId && !selectedConversation) {
      console.log('Immediately setting up initial conversation:', { initialListingId, initialReceiverId });
      // Set up conversation immediately without waiting for conversations to load
      fetchListingDetails(initialListingId, initialReceiverId);
    }
  }, [isOpen, initialListingId, initialReceiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    console.log('Initializing socket connection...');
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      toast.error('Failed to connect to chat server');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('new-message', (message: Message) => {
      console.log('📨 Received new message:', message);
      console.log('Current conversation ref:', currentConversationRef.current);
      
      // Update messages if this message belongs to the currently viewed conversation
      if (currentConversationRef.current === message.listingId) {
        setMessages(prev => {
          // Check if this message is already in the list (prevent duplicates)
          const exists = prev.some(m => m.id === message.id);
          if (exists) {
            console.log('Message already exists, skipping duplicate');
            return prev;
          }
          
          console.log('Adding message to current conversation view');
          return [...prev, message];
        });
      }
      
      // Update conversations list with new message
      updateConversationWithNewMessage(message);
    });

    newSocket.on('message-notification', (notification) => {
      console.log('🔔 Message notification:', notification);
      toast.success(`New message from ${notification.senderId}`);
    });

    newSocket.on('user-typing', (data) => {
      console.log('⌨️ User typing:', data);
      if (data.listingId === selectedConversation?.listingId) {
        setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
      }
    });

    newSocket.on('user-stop-typing', (data) => {
      console.log('⏹️ User stop typing:', data);
      if (data.listingId === selectedConversation?.listingId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error('Chat error occurred');
    });

    setSocket(newSocket);
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('Loading conversations...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 401) {
          // No conversations yet or auth issue - this is normal for new users
          console.log('No conversations found yet (normal for new users)');
          setConversations([]);
          return;
        }
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      console.log('Conversations loaded:', data.conversations);
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Don't show error toast for empty conversations - this is normal
      if (error instanceof Error && !error.message?.includes('Failed to load conversations')) {
        toast.error('Failed to load conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (listingId: string) => {
    try {
      console.log('Loading messages for listing:', listingId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/listing/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No messages yet - this is normal for new conversations
          console.log('No messages found for listing (normal for new conversations)');
          setMessages([]);
          return;
        }
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      console.log('Messages loaded:', data.messages);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Only show error for actual errors, not empty message lists
      if (error instanceof Error && !error.message?.includes('No messages')) {
        toast.error('Failed to load messages');
      }
      // Set empty array as fallback
      setMessages([]);
    }
  };

  const joinListingRoom = (listingId: string) => {
    if (socket) {
      console.log('🔗 Joining listing room:', listingId);
      socket.emit('join-listing', listingId);
    } else {
      console.log('❌ Socket not ready, cannot join room');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socket) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasConversation: !!selectedConversation, 
        hasSocket: !!socket 
      });
      return;
    }

    try {
      const messageData = {
        content: newMessage.trim(),
        receiverId: selectedConversation.otherUser.id,
        listingId: selectedConversation.listingId
      };

      console.log('🚀 Sending message via socket:', messageData);
      console.log('Socket connected:', socket.connected);
      console.log('Current conversation:', selectedConversation.listingId);

      // Send via socket - backend will save to database
      socket.emit('send-message', messageData);

      // Optimistically add the message to UI immediately
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: messageData.content,
        senderId: currentUserId,
        receiverId: messageData.receiverId,
        listingId: messageData.listingId,
        timestamp: new Date()
      };

      console.log('Adding optimistic message:', optimisticMessage);
      setMessages(prev => [...prev, optimisticMessage]);

      // Clear input immediately for better UX
      setNewMessage('');
      setIsTyping(false);
      if (socket) {
        socket.emit('typing-stop', { listingId: selectedConversation.listingId });
      }

      // Show success feedback
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing-start', { 
        listingId: selectedConversation.listingId,
        receiverId: selectedConversation.otherUser.id
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing-stop', { listingId: selectedConversation.listingId });
    }, 1000);
  };

  const updateConversationWithNewMessage = (message: Message) => {
    setConversations(prev => {
      const conversationIndex = prev.findIndex(
        conv => conv.listingId === message.listingId
      );

      if (conversationIndex >= 0) {
        const updatedConversations = [...prev];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          lastMessage: message
        };
        return updatedConversations;
      }

      return prev;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchListingDetails = async (listingId: string, receiverId: string) => {
    try {
      console.log('Fetching listing details for:', listingId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}`);
      if (response.ok) {
        const data = await response.json();
        const listing = data.listing;
        
        console.log('Listing details fetched:', listing);
        
        // Create a temporary conversation for immediate messaging
        const tempConversation: Conversation = {
          listingId: listingId,
          listing: {
            id: listingId,
            title: listing.title,
            imageUrls: listing.imageUrls || []
          },
          otherUser: {
            id: receiverId,
            name: listing.user.name,
            email: listing.user.email
          },
          lastMessage: {
            id: '',
            content: '',
            senderId: '',
            receiverId: '',
            listingId: listingId,
            timestamp: new Date()
          },
          unreadCount: 0
        };
        
        console.log('Created temp conversation:', tempConversation);
        setSelectedConversation(tempConversation);
        
        // Load any existing messages for this listing
        await loadMessages(listingId);
      }
    } catch (error) {
      console.error('Error fetching listing details:', error);
      toast.error('Failed to load listing details');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No conversations yet</p>
                <p className="text-sm">Start messaging by contacting a listing owner</p>
                {initialListingId && (
                  <p className="text-sm text-emerald-600 mt-2">
                    You can send a message to this listing owner!
                  </p>
                )}
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={`${conversation.listingId}-${conversation.otherUser.id}`}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.listingId === conversation.listingId &&
                    selectedConversation?.otherUser.id === conversation.otherUser.id
                      ? 'bg-emerald-50 border-emerald-200'
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {conversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.listing.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {selectedConversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.otherUser.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.listing.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUserId
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUserId ? 'text-emerald-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <p className="text-sm italic">Typing...</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 