
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyConversationProps {
  onNewConversation: () => void;
}

export const EmptyConversation: React.FC<EmptyConversationProps> = ({ onNewConversation }) => {
  return (
    <div className="flex items-center justify-center flex-1">
      <div className="text-center p-8">
        <h3 className="font-bold text-lg mb-2">No conversation selected</h3>
        <p className="text-muted-foreground mb-4">
          Select an existing conversation or start a new one
        </p>
        <Button onClick={onNewConversation}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
    </div>
  );
};
