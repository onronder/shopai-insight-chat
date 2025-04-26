// File: src/pages/AssistantPage.tsx

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConversationList } from "@/components/assistant/ConversationList";
import { ConversationHeader } from "@/components/assistant/ConversationHeader";
import { MessageDisplay } from "@/components/assistant/MessageDisplay";
import { MessageInput } from "@/components/assistant/MessageInput";
import { EmptyConversation } from "@/components/assistant/EmptyConversation";
import { useConversations } from "@/hooks/useConversations";
import { useStoreAccessGuard } from "@/hooks/useStoreAccessGuard";
import { PlanGate } from "@/components/auth/PlanGate";

const Assistant: React.FC = () => {
  useStoreAccessGuard();

  const {
    conversations,
    activeConversation,
    messageInput,
    loading,
    hasError,
    setMessageInput,
    handleNewConversation,
    handleSendMessage,
    handleSelectConversation,
    handleSelectSuggestion,
    refetchConversations,
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

  if (hasError) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <ErrorState
            title="Unable to load assistant data"
            description="There was a problem loading your conversations. Please try again."
            retryLabel="Refresh Data"
            onRetry={refetchConversations}
          />
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

// ✅ Pro AI Plan Required
export default function AssistantPage() {
  return (
    <PlanGate required="pro_ai">
      <Assistant />
    </PlanGate>
  );
}
