
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/formatters";

export type MessageType = "user" | "ai";

interface ChatMessageProps {
  type: MessageType;
  message: string;
  timestamp: Date;
  isLoading?: boolean;
}

/**
 * Chat message component for AI assistant conversations
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  message,
  timestamp,
  isLoading = false,
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
          <AvatarImage src="/placeholder.svg" alt="AI" />
          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col max-w-[75%]">
        <div 
          className={cn(
            "rounded-lg px-4 py-2",
            type === "user" 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-muted"
          )}
        >
          <p className={cn("whitespace-pre-wrap", isLoading && "animate-pulse")}>
            {message}
          </p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatTime(timestamp)}
        </span>
      </div>
      
      {type === "user" && (
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback className="bg-secondary">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
