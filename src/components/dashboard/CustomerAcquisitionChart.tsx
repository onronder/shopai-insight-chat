import React from "react"
import { AcquisitionData } from "@/hooks/useDashboardData"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  data?: AcquisitionData[]
}

export const CustomerAcquisitionChart: React.FC<Props> = ({ data = [] }) => {
  if (!data.length) return null

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">Customer Acquisition</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="new_customers" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}