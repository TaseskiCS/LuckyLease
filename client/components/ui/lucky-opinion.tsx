'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X, Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface LuckyOpinionProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    bedrooms: string;
    bathrooms: string;
    petsAllowed?: boolean;
    laundryInBuilding?: boolean;
    parkingAvailable?: boolean;
    airConditioning?: boolean;
    school?: string;
  };
  userProfile?: {
    budget: number;
    durationMonths: number;
    profileComment: string;
    distance: number;
  };
}

interface OpinionResponse {
  success: boolean;
  opinion: string;
  rating: number | null;
  listingId: string;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'lucky';
  message: string;
  timestamp: Date;
}

export function LuckyOpinion({ listing, userProfile }: LuckyOpinionProps) {
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [opinion, setOpinion] = useState<OpinionResponse | null>(null);

  const getLuckyOpinion = async () => {
    setLoading(true);
    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        message: `Hey Lucky! What do you think about "${listing.title}"?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Build amenities array
      const amenities: string[] = [];
      if (listing.petsAllowed) amenities.push('Pets Allowed');
      if (listing.laundryInBuilding) amenities.push('Laundry in Building');
      if (listing.parkingAvailable) amenities.push('Parking Available');
      if (listing.airConditioning) amenities.push('Air Conditioning');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/lucky-opinion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing: {
            ...listing,
            amenities
          },
          userProfile
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOpinion(data);
        
        // Add Lucky's response message
        const luckyMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'lucky',
          message: data.opinion,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, luckyMessage]);
        
      } else {
        toast.error(data.error || 'Failed to get Lucky\'s opinion');
      }
    } catch (error) {
      console.error('Error getting Lucky\'s opinion:', error);
      toast.error('Failed to get Lucky\'s opinion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatOpen = () => {
    setShowChat(true);
    if (messages.length === 0) {
      // Add initial greeting from Lucky
      const greeting: ChatMessage = {
        id: Date.now(),
        sender: 'lucky',
        message: "🍀 Top o' the mornin'! I'm Lucky, your personal sublet advisor! Ask me about any listing and I'll give you my honest opinion based on your needs!",
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  };

  const formatOpinionText = (opinionText: string) => {
    const lines = opinionText.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      if (line.includes('Pros:')) {
        return <div key={index} className="font-semibold text-green-600 mt-3 mb-1">✅ {line}</div>;
      } else if (line.includes('Cons:')) {
        return <div key={index} className="font-semibold text-red-600 mt-3 mb-1">❌ {line}</div>;
      } else if (line.trim().startsWith('-')) {
        return <div key={index} className="ml-4 text-sm text-gray-700">{line.replace(/^-\s*/, '• ')}</div>;
      } else if (line.includes('rating') || /\d+\.\d+/.test(line)) {
        return <div key={index} className="mt-3 p-2 bg-emerald-100 rounded-lg text-emerald-800 font-medium">{line}</div>;
      }
      return <div key={index} className="text-gray-700">{line}</div>;
    });
  };

  return (
    <>
      {/* Lucky Opinion Button */}
      <Button
        onClick={handleChatOpen}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        <span className="mr-2">🍀</span>
        Ask Lucky's Opinion
      </Button>

      {/* Chat Popup Overlay */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-white rounded-xl shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-emerald-50 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-emerald-300">
                  <Image
                    src="/luckylease.png"
                    alt="Lucky the Leprechaun"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800">Lucky 🍀</h3>
                  <p className="text-sm text-emerald-600">Your Sublet Advisor</p>
                </div>
                {opinion?.rating && (
                  <div className="flex items-center space-x-1 bg-emerald-100 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-emerald-600 fill-current" />
                    <span className="text-sm font-semibold text-emerald-700">
                      {opinion.rating}/10
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => setShowChat(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {message.sender === 'lucky' && (
                      <div className="w-8 h-8 relative rounded-full overflow-hidden border border-emerald-300 flex-shrink-0">
                        <Image
                          src="/luckylease.png"
                          alt="Lucky"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.sender === 'lucky' && message.message.includes('Pros:') ? (
                        <div className="space-y-1">
                          {formatOpinionText(message.message)}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 relative rounded-full overflow-hidden border border-emerald-300">
                      <Image
                        src="/luckylease.png"
                        alt="Lucky"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-gray-600">Lucky is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <div className="flex space-x-2">
                <Button
                  onClick={getLuckyOpinion}
                  disabled={loading || messages.some(msg => msg.sender === 'lucky' && msg.message.includes('Pros:'))}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Opinion...
                    </>
                  ) : messages.some(msg => msg.sender === 'lucky' && msg.message.includes('Pros:')) ? (
                    "Opinion Received! 🍀"
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Get Opinion on This Listing
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Lucky will analyze this listing based on your preferences
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
} 