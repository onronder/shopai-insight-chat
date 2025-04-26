// File: src/components/settings/AppPreferences.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { secureFetch } from "@/lib/secure-fetch";
import { useToast } from "@/components/ui/use-toast";

interface UserPreferences {
  notification_email: string;
  default_chart_range: "7" | "30" | "90";
  tips_enabled: boolean;
}

export default function AppPreferences() {
  const { toast } = useToast();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      const res = await secureFetch("/rest/v1/user_preferences?limit=1");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const [data] = await res.json();
      setPreferences(data);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const savePreferences = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const res = await secureFetch("/rest/v1/user_preferences", {
        method: "PATCH",
        body: JSON.stringify({
          notification_email: preferences.notification_email,
          default_chart_range: preferences.default_chart_range,
          tips_enabled: preferences.tips_enabled,
        }),
      });
      if (!res.ok) throw new Error("Failed to save preferences");

      toast({
        title: "Preferences updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  if (loading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Preferences</CardTitle>
        <CardDescription>Customize how ShopAI Insight looks and functions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Notification Email</Label>
          <Input
            value={preferences.notification_email || ""}
            onChange={(e) =>
              setPreferences({ ...preferences, notification_email: e.target.value })
            }
            placeholder="you@yourstore.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Chart Time Range</Label>
          <Select
            value={preferences.default_chart_range}
            onValueChange={(value) =>
              setPreferences({ ...preferences, default_chart_range: value as "7" | "30" | "90" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="tips_enabled"
            checked={preferences.tips_enabled}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, tips_enabled: checked === true })
            }
          />
          <Label htmlFor="tips_enabled">Enable AI Tips & Hints</Label>
        </div>

        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
