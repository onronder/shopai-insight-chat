
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChatInput } from './ChatInput';
import { ChatMessage, MessageType } from './ChatMessage';
import { ChatSuggestions } from './ChatSuggestions';
import { EmptyState } from '@/components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  type: MessageType;
  message: string;
  timestamp: Date;
}

interface ChatContainerProps {
  title?: string;
  description?: string;
  initialMessages?: Message[];
  suggestions?: string[];
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  title = "AI Assistant",
  description = "Ask questions about your store data",
  initialMessages = [],
  suggestions = [
    "What were my top selling products last month?",
    "How did my sales compare to the previous quarter?",
    "Where is most of my traffic coming from?",
    "What's my current inventory status?",
    "Analyze my customer retention rate",
  ],
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response after a delay
    // TODO: Replace with real API call to AI backend
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: `This is a placeholder response for: "${message}". In the actual implementation, this would be connected to a real AI backend that responds to your query.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pb-6 space-y-4">
        {messages.length === 0 ? (
          <div className="py-8">
            <EmptyState 
              title="No messages yet" 
              description="Start a conversation with the AI assistant"
              icon={<MessageSquare className="h-12 w-12 text-muted-foreground/50" />}
            />
            <div className="mt-8">
              <p className="text-sm text-center mb-4">Try asking one of these questions:</p>
              <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                type={message.type}
                message={message.message}
                timestamp={message.timestamp}
              />
            ))}
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t mt-auto">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <p className="text-xs text-muted-foreground mt-2">
          Type a question about your store data or pick a suggestion.
        </p>
      </div>
    </Card>
  );
};
