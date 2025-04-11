import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Send, Plus, PinIcon, Paperclip, ChevronRight } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Mock data for charts that will be rendered in chat
const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 8000 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 9500 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

type MessageType = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  containsChart?: boolean;
  chartType?: "line" | "bar" | "area" | "pie";
};

type ConversationType = {
  id: string;
  title: string;
  timestamp: Date;
  isPinned: boolean;
  messages: MessageType[];
};

// Sample conversations
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
        text: "Here's the sales trend for the past 6 months. I notice a steady increase with a significant jump in April, followed by a slight decline in May, then reaching the highest point in June. The overall trend shows a 137.5% growth from January to June.",
        timestamp: new Date(2023, 3, 15, 10, 31),
        containsChart: true,
        chartType: "line",
      },
    ],
  },
  {
    id: "2",
    title: "Customer Retention Strategies",
    timestamp: new Date(2023, 3, 14),
    isPinned: false,
    messages: [
      {
        id: "2-1",
        sender: "user",
        text: "What strategies should I implement to improve customer retention?",
        timestamp: new Date(2023, 3, 14, 15, 45),
      },
      {
        id: "2-2",
        sender: "assistant",
        text: "Based on your store data, I recommend implementing a loyalty program, personalized email follow-ups, and exclusive offers for repeat customers. Your customer data shows that customers who make a second purchase are 3x more likely to become long-term customers.",
        timestamp: new Date(2023, 3, 14, 15, 46),
      },
    ],
  },
  {
    id: "3",
    title: "Product Performance",
    timestamp: new Date(2023, 3, 13),
    isPinned: true,
    messages: [
      {
        id: "3-1",
        sender: "user",
        text: "Which products have the highest profit margin?",
        timestamp: new Date(2023, 3, 13, 9, 15),
      },
      {
        id: "3-2",
        sender: "assistant",
        text: "Your premium skincare line has the highest profit margins, with the 'Rejuvenating Night Cream' leading at a 78% margin. Here's a breakdown of your top products by margin:",
        timestamp: new Date(2023, 3, 13, 9, 16),
        containsChart: true,
        chartType: "bar",
      },
    ],
  },
];

// Sample suggestions for the assistant
const suggestions = [
  "Show sales trend for last month",
  "Which products have the highest return rate?",
  "Identify my best customer segments",
  "Compare this month's performance to last month",
  "What's my revenue forecast for next month?",
];

const AssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationType[]>(sampleConversations);
  const [activeConversation, setActiveConversation] = useState<ConversationType | null>(sampleConversations[0]);
  const [messageInput, setMessageInput] = useState("");

  // Function to render chat message content
  const renderMessageContent = (message: MessageType) => {
    if (!message.containsChart) {
      return <p className="whitespace-pre-wrap">{message.text}</p>;
    }

    // Render message with chart
    return (
      <div className="space-y-4">
        <p className="whitespace-pre-wrap">{message.text}</p>
        <div className="bg-muted/30 p-4 rounded-lg border">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              {message.chartType === "line" ? (
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              ) : message.chartType === "bar" ? (
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              ) : message.chartType === "area" ? (
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              ) : (
                <PieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage: MessageType = {
      id: Date.now().toString(),
      sender: "user",
      text: messageInput,
      timestamp: new Date(),
    };

    // Create mock assistant response
    const assistantResponse: MessageType = {
      id: (Date.now() + 1).toString(),
      sender: "assistant",
      text: "Thanks for your query. I'll analyze your shop data and provide insights on this shortly. This is a placeholder response since this is a demo.",
      timestamp: new Date(),
      containsChart: Math.random() > 0.5, // Randomly decide if response contains chart
      chartType: ["line", "bar", "area", "pie"][Math.floor(Math.random() * 4)] as "line" | "bar" | "area" | "pie", // Random chart type
    };

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage, assistantResponse],
    };

    setConversations(
      conversations.map((conv) => (conv.id === activeConversation.id ? updatedConversation : conv))
    );
    setActiveConversation(updatedConversation);
    setMessageInput("");
  };

  // Handle creating a new conversation
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

  return (
    <div className="container mx-auto h-full">
      <div className="flex h-[calc(100vh-9rem)] flex-col md:flex-row gap-4">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-64 flex flex-col border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex flex-col gap-2">
            <h3 className="font-bold">Your Conversations</h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-8" />
            </div>
            <Button onClick={handleNewConversation} className="w-full mt-2">
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
                    onClick={() => setActiveConversation(conversation)}
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

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-card">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b">
                <h3 className="font-bold">{activeConversation.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeConversation.messages.length} messages
                </p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-xl p-4 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {renderMessageContent(message)}
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Queries */}
              {activeConversation.messages.length < 1 && (
                <div className="px-4 py-6">
                  <h3 className="font-medium text-center mb-4">
                    How can I help you today?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-between"
                        onClick={() => setMessageInput(suggestion)}
                      >
                        {suggestion}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
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
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Try asking about sales trends, customer behavior, or inventory status.
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center p-8">
                <h3 className="font-bold text-lg mb-2">No conversation selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select an existing conversation or start a new one
                </p>
                <Button onClick={handleNewConversation}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
