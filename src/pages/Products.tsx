import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { VariantSalesChart } from "@/components/products/VariantSalesChart";
import { InventoryRiskTable } from "@/components/products/InventoryRiskTable";
import { ReturnRateChart } from "@/components/products/ReturnRateChart";
import { ProductLifecycleChart } from "@/components/products/ProductLifecycleChart";
import { useProductsData, Timeframe } from "@/hooks/useProductsData";
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { useStoreAccessGuard } from "@/hooks/useStoreAccessGuard";
import { PlanGate } from "@/components/auth/PlanGate";

const ProductsPage: React.FC = () => {
  useStoreAccessGuard();

  const {
    isLoading,
    error,
    errorMessage,
    variantSalesData,
    inventoryRisksData,
    returnRatesData,
    productLifecycleData,
    refetch,
    timeframe,
    setTimeframe,
    status,
    hasData
  } = useProductsData();

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <LoadingState message="Loading product analytics..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState
          title="Failed to load product insights"
          description={errorMessage || "Something went wrong"}
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      </AppLayout>
    );
  }

  if (!hasData) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <EmptyState
          title="No product data found"
          description="We couldn't find any product insights yet. This could be because you haven't connected your store, or your store doesn't have any products with sales data."
          action={<Button onClick={() => refetch()}>Refresh Data</Button>}
        />
      </AppLayout>
    );
  }

  return (
    <PlanGate required="basic">
      <AppLayout>
        <SyncStatusBanner />
        <div className="grid gap-4">
          <ProductsHeader timeframe={timeframe} onTimeframeChange={handleTimeframeChange} />

          {/* Top Selling Variants */}
          {status.variantSales === "pending" ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center h-[300px]">
                <LoadingState message="Loading top selling variants..." />
              </CardContent>
            </Card>
          ) : status.variantSales === "error" ? (
            <Card>
              <CardContent className="p-6">
                <ErrorState
                  title="Failed to load top selling variants"
                  description="An error occurred while fetching top selling variant data."
                  action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
                />
              </CardContent>
            </Card>
          ) : (
            <VariantSalesChart data={variantSalesData} />
          )}

          {/* Inventory Risks */}
          {status.inventoryRisks === "pending" ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center h-[300px]">
                <LoadingState message="Loading inventory risk data..." />
              </CardContent>
            </Card>
          ) : status.inventoryRisks === "error" ? (
            <Card>
              <CardContent className="p-6">
                <ErrorState
                  title="Failed to load inventory risks"
                  description="An error occurred while fetching inventory risk data."
                  action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
                />
              </CardContent>
            </Card>
          ) : (
            <InventoryRiskTable data={inventoryRisksData} />
          )}

          {/* Return Rates */}
          {status.returnRates === "pending" ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center h-[300px]">
                <LoadingState message="Loading return rate data..." />
              </CardContent>
            </Card>
          ) : status.returnRates === "error" ? (
            <Card>
              <CardContent className="p-6">
                <ErrorState
                  title="Failed to load return rates"
                  description="An error occurred while fetching return rate data."
                  action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
                />
              </CardContent>
            </Card>
          ) : (
            <ReturnRateChart data={returnRatesData} />
          )}

          {/* Product Lifecycle */}
          {status.productLifecycle === "pending" ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center h-[300px]">
                <LoadingState message="Loading product lifecycle data..." />
              </CardContent>
            </Card>
          ) : status.productLifecycle === "error" ? (
            <Card>
              <CardContent className="p-6">
                <ErrorState
                  title="Failed to load product lifecycle"
                  description="An error occurred while fetching lifecycle insights."
                  action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
                />
              </CardContent>
            </Card>
          ) : (
            <ProductLifecycleChart data={productLifecycleData} />
          )}
        </div>
      </AppLayout>
    </PlanGate>
  );
};

export default ProductsPage;
