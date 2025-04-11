
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Customer } from "@/types/customer-types";
import { CustomerSegmentBadge } from "./CustomerSegmentBadge";

interface CustomerSegmentsTableProps {
  customers: Customer[];
}

export const CustomerSegmentsTable: React.FC<CustomerSegmentsTableProps> = ({ customers }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Lifetime Value</TableHead>
          <TableHead>Last Order</TableHead>
          <TableHead>Segment</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id} className="hover:bg-muted/50 cursor-pointer">
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>${customer.ltv.toFixed(2)}</TableCell>
            <TableCell>{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : "N/A"}</TableCell>
            <TableCell>{customer.segment ? <CustomerSegmentBadge segment={customer.segment} /> : <Badge>New</Badge>}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
