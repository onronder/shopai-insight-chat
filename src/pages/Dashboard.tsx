import React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useDashboardData } from "@/hooks/useDashboardData"
import { LoadingState } from "@/components/common/LoadingState"
import { ErrorState } from "@/components/ui/ErrorState"
import { DashboardStatsCards } from "@/components/dashboard/DashboardStatsCards"
import { SalesOverTimeChart } from "@/components/dashboard/SalesOverTimeChart"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { CustomerAcquisitionChart } from "@/components/dashboard/CustomerAcquisitionChart"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"

const Dashboard: React.FC = () => {
  const {
    stats,
    sales,
    products,
    acquisition,
    activity,
    isLoading,
    error,
  } = useDashboardData()

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState title="Loading dashboard..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState title="Failed to load dashboard data" description={error.message} />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard Overview">
      <div className="grid gap-4">
        <DashboardStatsCards data={stats} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SalesOverTimeChart data={sales} />
          <CustomerAcquisitionChart data={acquisition} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopProductsChart data={products} />
          <ActivityFeed data={activity} />
        </div>
      </div>
    </AppLayout>
  )
}

export default Dashboard