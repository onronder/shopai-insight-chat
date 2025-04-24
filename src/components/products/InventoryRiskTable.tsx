import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { InventoryRisk } from "@/hooks/useProductsData"

interface InventoryRiskTableProps {
  data: InventoryRisk[]
}

type RiskType = "understock" | "optimal" | "overstock"

export const InventoryRiskTable: React.FC<InventoryRiskTableProps> = ({ data }) => {
  const getRiskBadgeVariant = (
    risk_type: RiskType | string
  ): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (risk_type) {
      case "understock":
        return "destructive"
      case "optimal":
        return "secondary"
      case "overstock":
        return "success" // ✅ mapped to valid variant
      default:
        return "outline"
    }
  }

  const getRiskDisplayText = (risk_type: RiskType | string): string => {
    switch (risk_type) {
      case "understock":
        return "Low Stock"
      case "optimal":
        return "Optimal"
      case "overstock":
        return "Overstock"
      default:
        return "Unknown"
    }
  }

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
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.variant_id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.sku || "N/A"}</TableCell>
                    <TableCell
                      className={
                        item.risk_type === "understock"
                          ? "text-red-500 font-medium"
                          : ""
                      }
                    >
                      {item.inventory} units
                    </TableCell>
                    <TableCell>{Math.abs(item.value).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getRiskBadgeVariant(item.risk_type)}
                        className="whitespace-nowrap"
                      >
                        {getRiskDisplayText(item.risk_type)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No inventory risks detected
          </div>
        )}
      </CardContent>
    </Card>
  )
}
