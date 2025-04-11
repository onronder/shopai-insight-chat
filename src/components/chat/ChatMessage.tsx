
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type MessageType = "user" | "ai";

interface ChatMessageProps {
  type: MessageType;
  message: string;
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  message,
  timestamp,
}) => {
  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        type === "user" ? "justify-end" : "justify-start"
      )}
    >
      {type === "ai" && (
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-shopify-primary text-white">AI</AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col max-w-[75%]">
        <div className={type === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {type === "user" && (
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-secondary">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
