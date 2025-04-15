import React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useAnalyticsData } from "@/hooks/useAnalyticsData"
import { ErrorState } from "@/components/ui/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { EmptyState } from "@/components/ui/EmptyState"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const Analytics: React.FC = () => {
  const {
    isLoading,
    error,
    salesData,
    funnelData,
    customerTypeData,
    topCountriesData,
    hasData
  } = useAnalyticsData()

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState title="Loading analytics..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState title="Failed to load analytics data" description={error.message} />
      </AppLayout>
    )
  }

  if (!hasData) {
    return (
      <AppLayout>
        <EmptyState title="No analytics available" description="We couldn’t find any analytics for this store." />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Store Analytics">
      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="customers">Customer Types</TabsTrigger>
          <TabsTrigger value="geo">Top Countries</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Sales Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} name="Total Revenue" />
                  <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} name="Net Revenue" />
                  <Line type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={2} name="Refunds" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Funnel Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Customer Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerTypeData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {customerTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Top Countries</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCountriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

export default Analytics