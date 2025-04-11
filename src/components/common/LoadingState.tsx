
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable loading state component for async operations
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading data...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <Loader className={`${sizeClasses[size]} text-primary animate-spin`} />
        <p className="text-muted-foreground text-center">{message}</p>
      </CardContent>
    </Card>
  );
};
