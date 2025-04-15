import React from "react"
import { SalesData } from "@/hooks/useDashboardData"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  data?: SalesData[]
}

export const SalesOverTimeChart: React.FC<Props> = ({ data = [] }) => {
  if (!data.length) return null

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">Sales Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}