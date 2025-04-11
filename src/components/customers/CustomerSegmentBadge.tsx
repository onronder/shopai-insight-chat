
import React from "react";
import { Badge } from "@/components/ui/badge";

interface CustomerSegmentBadgeProps {
  segment: string;
}

export const CustomerSegmentBadge: React.FC<CustomerSegmentBadgeProps> = ({ segment }) => {
  switch (segment) {
    case "high-value":
      return <Badge className="bg-emerald-500">High Value</Badge>;
    case "repeat":
      return <Badge className="bg-blue-500">Repeat Buyer</Badge>;
    case "at-risk":
      return <Badge className="bg-amber-500">At Risk</Badge>;
    default:
      return <Badge>New</Badge>;
  }
};
