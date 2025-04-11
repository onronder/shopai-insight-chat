
import React from "react";
import { ConversationType } from "./ConversationList";

interface ConversationHeaderProps {
  conversation: ConversationType;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({ 
  conversation 
}) => {
  return (
    <div className="p-4 border-b">
      <h3 className="font-bold">{conversation.title}</h3>
      <p className="text-xs text-muted-foreground">
        {conversation.messages.length} messages
      </p>
    </div>
  );
};
