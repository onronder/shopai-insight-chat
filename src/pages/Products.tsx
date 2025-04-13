
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductVolumeChart } from "@/components/products/ProductVolumeChart";
import { InventoryRiskTable } from "@/components/products/InventoryRiskTable";
import { ReturnRateChart } from "@/components/products/ReturnRateChart";
import { VariantSalesChart } from "@/components/products/VariantSalesChart";
import { ProductLifecycleChart } from "@/components/products/ProductLifecycleChart";
import { useProductsData } from "@/hooks/useProductsData";

const ProductsPage: React.FC = () => {
  const {
    isLoading,
    hasData,
    hasError,
    timeframe,
    setTimeframe,
    handleRetry,
    topSellingProductsData,
    inventoryAtRiskData,
    returnRateData,
    variantSalesData,
    productLifecycleData
  } = useProductsData();
  
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
          <Skeleton className="h-96 w-full" />
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
  
  if (hasError) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <ErrorState
            title="Unable to load product data"
            description="There was a problem loading your product data. Please try again."
            retryLabel="Refresh Data"
            onRetry={handleRetry}
          />
        </div>
      </AppLayout>
    );
  }
  
  if (!hasData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="No product data available"
            description="Connect your store to import product data or add products manually"
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
        <ProductsHeader 
          timeframe={timeframe} 
          onTimeframeChange={setTimeframe} 
        />

        <ProductVolumeChart data={topSellingProductsData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InventoryRiskTable data={inventoryAtRiskData} />
          <ReturnRateChart data={returnRateData} />
          <VariantSalesChart data={variantSalesData} />
          <ProductLifecycleChart data={productLifecycleData} />
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductsPage;
