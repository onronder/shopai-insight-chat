import { useEffect, useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";
import { ConversationType, MessageType } from "@/components/assistant/ConversationList";

// Still mock data until backend API is integrated
const sampleConversations: ConversationType[] = [
  {
    id: "1",
    title: "Sales Performance Analysis",
    timestamp: new Date(2023, 3, 15),
    isPinned: true,
    messages: [
      {
        id: "1-1",
        sender: "user",
        text: "Show me sales trends for the last 6 months",
        timestamp: new Date(2023, 3, 15, 10, 30),
      },
      {
        id: "1-2",
        sender: "assistant",
        text: "Here's the sales trend. Growth has been 137% from January to June.",
        timestamp: new Date(2023, 3, 15, 10, 31),
        containsChart: true,
        chartType: "line",
      },
    ],
  },
];

export const useConversations = () => {
  const [conversations, setConversations] = useState<ConversationType[]>(sampleConversations);
  const [activeConversation, setActiveConversation] = useState<ConversationType | null>(sampleConversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setHasError(false);

      try {
        // 🔒 secureFetch is ready for real API usage
        // const res = await secureFetch("/functions/v1/fetch_conversations");
        // const data: ConversationType[] = await res.json();

        const timer = setTimeout(() => {
          setConversations(sampleConversations);
          setActiveConversation(sampleConversations[0]);
          setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setHasError(true);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [retryCounter]);

  const handleNewConversation = () => {
    const newConversation: ConversationType = {
      id: Date.now().toString(),
      title: "New Conversation",
      timestamp: new Date(),
      isPinned: false,
      messages: [],
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversation(newConversation);
    setMessageInput("");
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      sender: "user",
      text: messageInput,
      timestamp: new Date(),
    };

    const assistantResponse: MessageType = {
      id: (Date.now() + 1).toString(),
      sender: "assistant",
      text: "This is a placeholder response from ShopAI.",
      timestamp: new Date(),
      containsChart: Math.random() > 0.5,
      chartType: ["line", "bar", "area", "pie"][
        Math.floor(Math.random() * 4)
      ] as "line" | "bar" | "area" | "pie",
    };

    const updatedConversation: ConversationType = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage, assistantResponse],
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConversation.id ? updatedConversation : c))
    );
    setActiveConversation(updatedConversation);
    setMessageInput("");
  };

  const handleSelectConversation = (conversation: ConversationType) => {
    setActiveConversation(conversation);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setMessageInput(suggestion);
  };

  const refetchConversations = () => {
    setRetryCounter((prev) => prev + 1);
  };

  return {
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
  };
};
