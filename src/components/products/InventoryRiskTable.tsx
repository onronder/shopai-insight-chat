import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { InventoryRiskItem } from "@/hooks/useProductsData";

interface InventoryRiskTableProps {
  data: InventoryRiskItem[];
}

export const InventoryRiskTable: React.FC<InventoryRiskTableProps> = ({ data }) => {
  // Helper function to get the badge variant based on risk type
  const getRiskBadgeVariant = (risk_type: string) => {
    switch(risk_type) {
      case 'stockout': return 'destructive';
      case 'low_stock': return 'warning';
      case 'overstock': return 'secondary';
      default: return 'outline';
    }
  };

  // Helper function to get the risk display text
  const getRiskDisplayText = (risk_type: string) => {
    switch(risk_type) {
      case 'stockout': return 'Out of Stock';
      case 'low_stock': return 'Low Stock';
      case 'overstock': return 'Overstock';
      default: return 'Healthy';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Inventory at Risk</CardTitle>
          <CardDescription>Products with inventory management issues</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Sales Velocity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={`${item.product_id}-${item.variant_title}`}>
                  <TableCell className="font-medium">{item.product_title}</TableCell>
                  <TableCell>{item.variant_title}</TableCell>
                  <TableCell className={item.risk_type === 'stockout' || item.risk_type === 'low_stock' ? "text-red-500 font-medium" : ""}>
                    {item.inventory_level} units
                  </TableCell>
                  <TableCell>{item.reorder_point || 'N/A'}</TableCell>
                  <TableCell>{item.sales_velocity?.toFixed(2) || '0'} units/day</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getRiskBadgeVariant(item.risk_type) as any}
                    >
                      {getRiskDisplayText(item.risk_type)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No inventory risks detected
          </div>
        )}
      </CardContent>
    </Card>
  );
};
