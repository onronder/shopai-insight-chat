
import React from "react";
import { Search, Plus, PinIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ConversationType = {
  id: string;
  title: string;
  timestamp: Date;
  isPinned: boolean;
  messages: MessageType[];
};

export type MessageType = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  containsChart?: boolean;
  chartType?: "line" | "bar" | "area" | "pie";
};

interface ConversationListProps {
  conversations: ConversationType[];
  activeConversation: ConversationType | null;
  onSelectConversation: (conversation: ConversationType) => void;
  onNewConversation: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
}) => {
  return (
    <div className="w-full md:w-64 flex flex-col border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex flex-col gap-2">
        <h3 className="font-bold">Your Conversations</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-8" />
        </div>
        <Button onClick={onNewConversation} className="w-full mt-2">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="all" className="px-4 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="pinned" className="flex-1">Pinned</TabsTrigger>
          </TabsList>
          <div className="mt-4 space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeConversation?.id === conversation.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium truncate">{conversation.title}</h4>
                  {conversation.isPinned && <PinIcon className="h-3 w-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {conversation.timestamp.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
};
