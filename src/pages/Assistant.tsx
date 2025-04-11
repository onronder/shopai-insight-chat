
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConversationList, ConversationType, MessageType } from "@/components/assistant/ConversationList";
import { ConversationHeader } from "@/components/assistant/ConversationHeader";
import { MessageDisplay } from "@/components/assistant/MessageDisplay";
import { MessageInput } from "@/components/assistant/MessageInput";
import { EmptyConversation } from "@/components/assistant/EmptyConversation";

// TODO: Replace with API call to fetch conversation history from backend
const sampleConversations: ConversationType[] = [
  {
    id: "1",
    title: "Sales Performance Analysis",
    timestamp: new Date(2023, 3, 15),
    isPinned: true,
    messages: [
      {
        id: "1-1",
        sender: "user",
        text: "Show me sales trends for the last 6 months",
        timestamp: new Date(2023, 3, 15, 10, 30),
      },
      {
        id: "1-2",
        sender: "assistant",
        text: "Here's the sales trend for the past 6 months. I notice a steady increase with a significant jump in April, followed by a slight decline in May, then reaching the highest point in June. The overall trend shows a 137.5% growth from January to June.",
        timestamp: new Date(2023, 3, 15, 10, 31),
        containsChart: true,
        chartType: "line",
      },
    ],
  },
];

const AssistantPage: React.FC = () => {
  // TODO: Replace static or placeholder content with live data
  const [conversations, setConversations] = useState<ConversationType[]>(sampleConversations);
  const [activeConversation, setActiveConversation] = useState<ConversationType | null>(sampleConversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);

  // TODO: Replace with actual API loading and error handling
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto h-full">
          <div className="flex h-[calc(100vh-9rem)] flex-col md:flex-row gap-4">
            <Skeleton className="w-full md:w-64 h-full" />
            <Skeleton className="flex-1 h-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (conversations.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto h-full">
          <EmptyState
            title="No conversations yet"
            description="Start chatting with the AI assistant to analyze your store data"
            actionLabel="New Conversation"
            onAction={handleNewConversation}
          />
        </div>
      </AppLayout>
    );
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    // TODO: Implement input validation and sanitization
    const newMessage: MessageType = {
      id: Date.now().toString(),
      sender: "user",
      text: messageInput,
      timestamp: new Date(),
    };

    // TODO: Replace with actual API call to AI backend service
    const assistantResponse: MessageType = {
      id: (Date.now() + 1).toString(),
      sender: "assistant",
      text: "Thanks for your query. I'll analyze your shop data and provide insights on this shortly. This is a placeholder response since this is a demo.",
      timestamp: new Date(),
      containsChart: Math.random() > 0.5,
      chartType: ["line", "bar", "area", "pie"][Math.floor(Math.random() * 4)] as "line" | "bar" | "area" | "pie",
    };

    // TODO: Implement conversation update through API
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage, assistantResponse],
    };

    setConversations(
      conversations.map((conv) => (conv.id === activeConversation.id ? updatedConversation : conv))
    );
    setActiveConversation(updatedConversation);
    setMessageInput("");
  };

  const handleNewConversation = () => {
    // TODO: Implement API integration for conversation creation
    const newConversation: ConversationType = {
      id: Date.now().toString(),
      title: "New Conversation",
      timestamp: new Date(),
      isPinned: false,
      messages: [],
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation);
    setMessageInput("");
  };

  const handleSelectConversation = (conversation: ConversationType) => {
    setActiveConversation(conversation);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setMessageInput(suggestion);
  };

  return (
    <AppLayout>
      <div className="container mx-auto h-full">
        <div className="flex h-[calc(100vh-9rem)] flex-col md:flex-row gap-4">
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />

          <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-card">
            {activeConversation ? (
              <>
                <ConversationHeader conversation={activeConversation} />
                <MessageDisplay 
                  messages={activeConversation.messages}
                  onSelectSuggestion={handleSelectSuggestion}
                />
                <MessageInput
                  onSendMessage={handleSendMessage}
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                />
              </>
            ) : (
              <EmptyConversation onNewConversation={handleNewConversation} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AssistantPage;
