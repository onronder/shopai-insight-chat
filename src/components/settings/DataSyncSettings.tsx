
import React, { useState } from "react";
import { Clock, RotateCw } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const DataSyncSettings: React.FC = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    // TODO: Replace with API call to trigger data synchronization
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Data sync completed",
        description: "All your store data has been synchronized"
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sync Preferences</CardTitle>
        <CardDescription>
          Control how and when store data is synchronized
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="syncInterval">Auto-sync Interval</Label>
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <Select defaultValue="daily">
            <SelectTrigger id="syncInterval">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleManualSync} 
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Run Manual Sync
              </>
            )}
          </Button>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {/* TODO: Replace with actual last sync time from API */}
            Last synced 2h ago
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSyncSettings;
