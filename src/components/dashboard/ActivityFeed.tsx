import React from "react"
import { ActivityData } from "@/hooks/useDashboardData"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface Props {
  data?: ActivityData[]
}

export const ActivityFeed: React.FC<Props> = ({ data = [] }) => {
  if (!data.length) return null

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
        <ul className="space-y-2">
          {data.map((item, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <Clock className="w-4 h-4 mt-1" />
              <div>
                <div className="text-foreground font-medium">{item.action}</div>
                <div className="text-muted-foreground">{item.details}</div>
                <div className="text-xs">{item.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}