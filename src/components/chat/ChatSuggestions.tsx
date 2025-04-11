
import React from "react";
import { Button } from "@/components/ui/button";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  onSuggestionClick,
}) => {
  const suggestions = [
    "What were my top selling products last month?",
    "How did my sales compare to the previous quarter?",
    "Where is most of my traffic coming from?",
    "What's my current inventory status?",
    "Analyze my customer retention rate",
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          className="rounded-full text-xs px-3"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};
