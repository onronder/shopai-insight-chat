
import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const PrivacySettings: React.FC = () => {
  const { toast } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleDeleteHistory = () => {
    setConfirmDialogOpen(false);
    // TODO: Replace with API call to delete chat history
    toast({
      title: "History deleted",
      description: "AI chat history deleted successfully"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>GDPR & Privacy</CardTitle>
        <CardDescription>
          Manage your data and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete all AI chat history
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                This will permanently delete all AI chat history for your store. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteHistory}
              >
                Yes, Delete Everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center space-x-2">
          {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
          <Switch id="optOutAnalytics" />
          <Label htmlFor="optOutAnalytics">
            Opt out of usage analytics
          </Label>
        </div>

        <div className="rounded-md bg-muted p-4 text-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <p>We comply with GDPR, CCPA, and Shopify's privacy terms.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
