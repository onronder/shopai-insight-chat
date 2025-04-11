
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface InventoryItem {
  name: string;
  stock: number;
  daysSinceLastSale: number;
  critical: boolean;
}

interface InventoryRiskTableProps {
  data: InventoryItem[];
}

export const InventoryRiskTable: React.FC<InventoryRiskTableProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Inventory at Risk</CardTitle>
          <CardDescription>Products with low stock or low sales</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>No Sales In</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                  {product.stock} units
                </TableCell>
                <TableCell>{product.daysSinceLastSale} days</TableCell>
                <TableCell>
                  {product.critical ? (
                    <Badge variant="destructive">Restock Now</Badge>
                  ) : (
                    <Badge variant="outline">Monitor</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
