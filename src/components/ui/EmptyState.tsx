import React from 'react';
import { Card, CardContent, CardFooter } from './card';
import { Button } from './button';
import { PlusCircle, AlertCircle } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

/**
 * Reusable empty state component for when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <AlertCircle className="h-12 w-12 text-muted-foreground/50" />,
  actionLabel,
  onAction,
  action,
}) => {
  return (
    <Card className="w-full text-center">
      <CardContent className="pt-10 pb-6 flex flex-col items-center gap-4">
        {icon}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
      {(actionLabel && onAction) || action ? (
        <CardFooter className="flex justify-center pb-10">
          {action ? (
            action
          ) : actionLabel && onAction ? (
            <Button onClick={onAction}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
};
