import React from "react"
import { StatData } from "@/hooks/useDashboardData"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Props {
  data?: StatData[]
}

export const DashboardStatsCards: React.FC<Props> = ({ data = [] }) => {
  if (!data.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((stat, i) => (
        <Card key={i} className="p-4">
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <span className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </span>
            </div>
            <div className="text-xl font-semibold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.title}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}