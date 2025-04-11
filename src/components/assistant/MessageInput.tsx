
import React, { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  messageInput: string;
  setMessageInput: (message: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  messageInput,
  setMessageInput,
}) => {
  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Button variant="outline" size="icon">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Ask me about your store data..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!messageInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Try asking about sales trends, customer behavior, or inventory status.
      </div>
    </div>
  );
};
