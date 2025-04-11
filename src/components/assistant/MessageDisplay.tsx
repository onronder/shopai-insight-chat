
import React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageType } from "./ConversationList";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// TODO: Replace this static data with API call to fetch sales data from backend
const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 8000 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 9500 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface MessageDisplayProps {
  messages: MessageType[];
  suggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  messages,
  suggestions = [
    "Show sales trend for last month",
    "Which products have the highest return rate?",
    "Identify my best customer segments",
    "Compare this month's performance to last month",
    "What's my revenue forecast for next month?",
  ],
  onSelectSuggestion,
}) => {
  const renderMessageContent = (message: MessageType) => {
    if (!message.containsChart) {
      return <p className="whitespace-pre-wrap">{message.text}</p>;
    }

    // TODO: Replace with dynamic chart rendering based on actual data from API
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

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {messages.length > 0 ? (
        messages.map((message) => (
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
        ))
      ) : (
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
                onClick={() => onSelectSuggestion(suggestion)}
              >
                {suggestion}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
