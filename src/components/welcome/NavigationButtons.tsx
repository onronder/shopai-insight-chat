
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface NavigationButtonsProps {
  syncComplete: boolean;
  onSkip: () => void;
  onContinue: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ 
  syncComplete, 
  onSkip, 
  onContinue 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <Button 
        variant="outline" 
        onClick={onSkip}
        className="order-2 sm:order-1"
      >
        Skip and explore
      </Button>
      
      <Button 
        onClick={onContinue} 
        disabled={!syncComplete}
        className="order-1 sm:order-2 gap-2"
      >
        Go to Dashboard
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
