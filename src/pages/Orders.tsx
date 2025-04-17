import React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { OrdersHeader } from "@/components/orders/OrdersHeader"
import { OrderVolumeChart } from "@/components/orders/OrderVolumeChart"
import { OrderStatusChart } from "@/components/orders/OrderStatusChart"
import { AverageOrderValueChart } from "@/components/orders/AverageOrderValueChart"
import { DiscountedOrdersList } from "@/components/orders/DiscountedOrdersList"
import { FulfillmentDelaysChart } from "@/components/orders/FulfillmentDelaysChart"
import { useOrdersData } from "@/hooks/useOrdersData"
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner"

const OrdersPage: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    timeframe,
    setTimeframe
  } = useOrdersData()

  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <Skeleton className="h-96 w-full" />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState
          title="Unable to load order metrics"
          description={error.message}
          onRetry={refetch}
        />
      </AppLayout>
    )
  }

  if (!data || data.sales.length === 0) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <EmptyState
          title="No order data found"
          description="We couldn't find any orders for your store yet."
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <SyncStatusBanner />
      <div className="grid gap-4">
        <OrdersHeader timeframe={timeframe} onTimeframeChange={setTimeframe} />
        <OrderVolumeChart data={data.sales.map(s => ({
          date: s.name,
          orders: s.sales,
          isSale: false // Adding default value for optional property
        }))} />
        <OrderStatusChart data={data.statuses.map(status => ({
          label: status.status,
          count: status.count
        }))} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AverageOrderValueChart data={[{
            date: new Date().toISOString().split('T')[0], // Adding required date property
            value: data.aov.value
          }]} />
          <FulfillmentDelaysChart data={data.fulfillment.map(f => ({
            day: f.order_id,
            value: f.delay_days
          }))} />
        </div>
        <DiscountedOrdersList data={data.discounts.map((d, index) => ({
          id: index.toString(),
          ...d
        }))} />
      </div>
    </AppLayout>
  )
}

export default OrdersPage