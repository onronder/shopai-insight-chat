
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  enableVoice?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Ask about your store's analytics...",
  enableVoice = true,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  // Handle pressing Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input functionality
    console.log("Voice input requested - not yet implemented");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="resize-none pr-24 min-h-[60px]"
        disabled={isLoading}
      />
      <div className="absolute right-2 bottom-2 flex gap-2">
        {enableVoice && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleVoiceInput}
            disabled={isLoading}
            className="rounded-full"
          >
            <Mic className="h-5 w-5" />
            <span className="sr-only">Voice input</span>
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !inputValue.trim()}
          className="rounded-full"
        >
          <SendHorizontal className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
};
