
import React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/layout/ModeToggle";

const AppPreferences: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Preferences</CardTitle>
        <CardDescription>
          Customize how ShopAI Insight looks and functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Interface Theme</Label>
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <div>
            <ModeToggle />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeRange">Default Chart Time Range</Label>
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <Select defaultValue="30">
            <SelectTrigger id="timeRange">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <Checkbox id="allowStaffAccess" defaultChecked={true} />
          <Label htmlFor="allowStaffAccess">
            Allow staff users to access AI Assistant
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppPreferences;
