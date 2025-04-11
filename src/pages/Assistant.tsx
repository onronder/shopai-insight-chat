
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConversationList } from "@/components/assistant/ConversationList";
import { ConversationHeader } from "@/components/assistant/ConversationHeader";
import { MessageDisplay } from "@/components/assistant/MessageDisplay";
import { MessageInput } from "@/components/assistant/MessageInput";
import { EmptyConversation } from "@/components/assistant/EmptyConversation";
import { useConversations } from "@/hooks/useConversations";

const AssistantPage: React.FC = () => {
  const {
    conversations,
    activeConversation,
    messageInput,
    loading,
    setMessageInput,
    handleNewConversation,
    handleSendMessage,
    handleSelectConversation,
    handleSelectSuggestion,
  } = useConversations();

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
