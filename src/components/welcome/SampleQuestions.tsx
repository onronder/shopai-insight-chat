
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Sample questions for AI assistant
const sampleQuestions = [
  "What were my top-selling products last month?",
  "How did my conversion rate change after the last promotion?",
  "Which customer segment has the highest lifetime value?",
  "What's my average order value compared to last quarter?",
  "Identify products with high return rates",
  "Which marketing channel brings the most revenue?"
];

export const SampleQuestions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Try asking the AI...</CardTitle>
        <CardDescription>
          Once setup is complete, you can ask ShopAI questions about your store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleQuestions.map((question, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="justify-start h-auto py-3 px-4"
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
