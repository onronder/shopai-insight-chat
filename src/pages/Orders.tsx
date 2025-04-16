import React from "react"

import { SyncBanner } from "@/components/ui/SyncBanner";
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
    <SyncBanner />
      <AppLayout>
        <Skeleton className="h-96 w-full" />
      </AppLayout>
    )
  }

  if (error) {
    return (
    <SyncBanner />
      <AppLayout>
        <ErrorState
          title="Unable to load order metrics"
          description={error.message}
          onRetry={refetch}
        />
      </AppLayout>
    )
  }

  if (!data || !data.sales?.length) {
    return (
    <SyncBanner />
      <AppLayout>
        <EmptyState
          title="No order data found"
          description="We couldn’t find any orders for your store yet."
        />
      </AppLayout>
    )
  }

  return (
    <SyncBanner />
    <AppLayout title="Orders">
      <div className="grid gap-4">
        <OrdersHeader timeframe={timeframe} onChange={setTimeframe} />
        <OrderVolumeChart data={data.sales} />
        <OrderStatusChart data={data.statuses} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AverageOrderValueChart data={data.aov} />
          <FulfillmentDelaysChart data={data.fulfillment} />
        </div>
        <DiscountedOrdersList data={data.discounts} />
      </div>
    </AppLayout>
  )
}

export default OrdersPage