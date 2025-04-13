
import React from 'react';
import { Card, CardContent, CardFooter } from './card';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}

/**
 * Reusable error state component for displaying error conditions
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  retryLabel = "Try again",
  onRetry,
}) => {
  return (
    <Card className="w-full border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/20 rounded-xl">
      <CardContent className="pt-10 pb-6 flex flex-col items-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">{title}</h3>
          <p className="text-sm text-red-600 dark:text-red-400">{description}</p>
        </div>
      </CardContent>
      {onRetry && (
        <CardFooter className="flex justify-center pb-10">
          <Button variant="destructive" onClick={onRetry}>
            {retryLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
