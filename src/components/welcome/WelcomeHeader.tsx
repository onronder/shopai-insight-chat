import React from "react";

interface WelcomeHeaderProps {
  storeName: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ storeName }) => (
  <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-bold flex items-center gap-2">
      Welcome to <span className="text-primary">ShopAI Insight</span>,{" "}
      <span className="text-primary">{storeName}</span> 👋
    </h1>
    <p className="text-muted-foreground text-lg">
      We're syncing your Shopify store data to personalize your experience.
    </p>
  </div>
);
