
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const AIAssistantSettings: React.FC = () => {
  const [responseLength, setResponseLength] = useState([50]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant Configuration</CardTitle>
        <CardDescription>
          Customize how the AI responds to your queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="responseTone">Response Tone</Label>
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <Select defaultValue="neutral">
            <SelectTrigger id="responseTone">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Response Length</Label>
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <div className="space-y-1">
            <Slider 
              value={responseLength} 
              onValueChange={setResponseLength} 
              max={100} 
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Short</span>
              <span>Detailed</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeGoal">Default Store Goal</Label>
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <Input 
            id="storeGoal" 
            defaultValue="Increase repeat customer revenue by 15%" 
            placeholder="e.g., increase repeat customer revenue" 
          />
          <p className="text-xs text-muted-foreground">
            This goal helps the AI provide more relevant insights
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistantSettings;
