
import React, { useEffect, useRef, useState } from "react";
import { ChatMessage, MessageType } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatSuggestions } from "./ChatSuggestions";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your ShopAI assistant. How can I help you analyze your Shopify store data today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if we need to show the scroll-to-bottom button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button if not at bottom
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const responseOptions = [
        "Based on your Shopify data, sales have increased by 15% compared to last month.",
        "Your best-selling product this week is 'Premium Headphones' with 47 units sold.",
        "I notice your customer retention rate is 68%. The industry average is around 65%, so you're doing well!",
        "Your average order value has increased from $42 to $58 over the past 3 months. Would you like to see what's contributing to this growth?",
        "Looking at your traffic sources, 65% of your orders came from social media campaigns, primarily Instagram and Facebook.",
      ];
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: responseOptions[Math.floor(Math.random() * responseOptions.length)],
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            type={message.type}
            message={message.content}
            timestamp={message.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex space-x-2 pl-12">
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-24 right-8 rounded-full shadow-md"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}

      <div className="p-4 border-t">
        <ChatSuggestions onSuggestionClick={handleSendMessage} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
