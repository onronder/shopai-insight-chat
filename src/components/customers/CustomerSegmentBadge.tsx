// File: src/components/customers/CustomerSegmentBadge.tsx

import React from "react";
import { Badge } from "@/components/ui/badge";

interface CustomerSegmentBadgeProps {
  segment: string;
}

export const CustomerSegmentBadge: React.FC<CustomerSegmentBadgeProps> = ({ segment }) => {
  const normalized = segment.toLowerCase().replace(/\s/g, "-");

  switch (normalized) {
    case "high-value":
      return <Badge className="bg-emerald-500 text-white">High Value</Badge>;
    case "repeat":
    case "repeat-buyer":
      return <Badge className="bg-blue-500 text-white">Repeat Buyer</Badge>;
    case "at-risk":
      return <Badge className="bg-amber-500 text-black">At Risk</Badge>;
    case "low-value":
      return <Badge className="bg-orange-400 text-white">Low Value</Badge>;
    case "inactive":
      return <Badge className="bg-gray-400 text-white">Inactive</Badge>;
    default:
      return <Badge className="bg-muted text-muted-foreground">New</Badge>;
  }
};
