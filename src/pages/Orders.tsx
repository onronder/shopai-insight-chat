
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrderVolumeChart } from "@/components/orders/OrderVolumeChart";
import { OrderStatusChart } from "@/components/orders/OrderStatusChart";
import { AverageOrderValueChart } from "@/components/orders/AverageOrderValueChart";
import { DiscountedOrdersList } from "@/components/orders/DiscountedOrdersList";
import { FulfillmentDelaysChart } from "@/components/orders/FulfillmentDelaysChart";
import { useOrdersData } from "@/hooks/useOrdersData";

const OrdersPage: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    timeframe,
    setTimeframe
  } = useOrdersData();
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <ErrorState
            title="Unable to load order data"
            description="There was a problem loading your order data. Please try again."
            retryLabel="Refresh Data"
            onRetry={refetch}
          />
        </div>
      </AppLayout>
    );
  }
  
  if (!data || !data.orderVolumeData.length) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="No order data available"
            description="Connect your store to import order history or create new orders"
            actionLabel="Connect Store"
            onAction={() => console.log("Connect store clicked")}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto space-y-6">
        <OrdersHeader 
          timeframe={timeframe} 
          onTimeframeChange={setTimeframe} 
        />

        <OrderVolumeChart data={data.orderVolumeData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrderStatusChart data={data.orderStatusData} colors={data.colors} />
          <AverageOrderValueChart data={data.aovData} />
          <DiscountedOrdersList data={data.discountedOrdersData} />
          <FulfillmentDelaysChart data={data.fulfillmentDelaysData} />
        </div>
      </div>
    </AppLayout>
  );
};

export default OrdersPage;
