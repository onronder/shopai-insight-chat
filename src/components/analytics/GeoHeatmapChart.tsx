// File: src/components/analytics/GeoHeatmapChart.tsx

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip } from "recharts"

export interface GeoHeatmapPoint {
  lat: number
  lng: number
  value: number
  city: string
  country: string
}

interface Props {
  data: GeoHeatmapPoint[]
}

export const GeoHeatmapChart: React.FC<Props> = ({ data }) => {
  // Determine bounds for axes
  const latRange = data.map(d => d.lat)
  const lngRange = data.map(d => d.lng)
  const minLat = Math.min(...latRange)
  const maxLat = Math.max(...latRange)
  const minLng = Math.min(...lngRange)
  const maxLng = Math.max(...lngRange)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geo Heatmap</CardTitle>
        <CardDescription>City-level sales distribution</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-center">
            <p className="text-muted-foreground">No geo data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <XAxis 
                dataKey="lng" 
                type="number" 
                domain={[minLng - 5, maxLng + 5]} 
                name="Longitude"
              />
              <YAxis 
                dataKey="lat" 
                type="number" 
                domain={[minLat - 5, maxLat + 5]} 
                name="Latitude"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string, props: any) => [
                  `${props.payload.city}, ${props.payload.country}: ${props.payload.value.toLocaleString()} orders`,
                  "Location"
                ]}
              />
              <Scatter 
                data={data} 
                fill="#8b5cf6" 
                name="Orders"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
