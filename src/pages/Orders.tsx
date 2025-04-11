
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrderVolumeChart } from "@/components/orders/OrderVolumeChart";
import { OrderStatusChart } from "@/components/orders/OrderStatusChart";
import { AverageOrderValueChart } from "@/components/orders/AverageOrderValueChart";
import { DiscountedOrdersList } from "@/components/orders/DiscountedOrdersList";
import { FulfillmentDelaysChart } from "@/components/orders/FulfillmentDelaysChart";
import { 
  orderVolumeData, 
  orderStatusData, 
  COLORS, 
  aovData, 
  discountedOrdersData, 
  fulfillmentDelaysData 
} from "@/data/order-data";

const OrdersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(true);
  const [timeframe, setTimeframe] = useState("last14");
  
  React.useEffect(() => {
    setLoading(false);
  }, []);
  
  if (loading) {
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
  
  if (!hasData) {
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

        <OrderVolumeChart data={orderVolumeData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrderStatusChart data={orderStatusData} colors={COLORS} />
          <AverageOrderValueChart data={aovData} />
          <DiscountedOrdersList data={discountedOrdersData} />
          <FulfillmentDelaysChart data={fulfillmentDelaysData} />
        </div>
      </div>
    </AppLayout>
  );
};

export default OrdersPage;
