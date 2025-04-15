import React from "react"
import { ProductData } from "@/hooks/useDashboardData"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  data?: ProductData[]
}

export const TopProductsChart: React.FC<Props> = ({ data = [] }) => {
  if (!data.length) return null

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">Top Products</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}