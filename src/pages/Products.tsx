import React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoadingState } from "@/components/common/LoadingState"
import { ErrorState } from "@/components/ui/ErrorState"
import { ProductsHeader } from "@/components/products/ProductsHeader"
import { VariantSalesChart } from "@/components/products/VariantSalesChart"
import { InventoryRiskTable } from "@/components/products/InventoryRiskTable"
import { ReturnRateChart } from "@/components/products/ReturnRateChart"
import { ProductLifecycleChart } from "@/components/products/ProductLifecycleChart"
import { useProductsData } from "@/hooks/useProductsData"
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner"

const ProductsPage: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
    timeframe,
    setTimeframe
  } = useProductsData()

  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <LoadingState message="Loading product analytics..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState title="Failed to load product insights" description={error.message} onRetry={refetch} />
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState title="No product data found" description="We couldn't find any product insights yet." />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <SyncStatusBanner />
      <div className="grid gap-4">
        <ProductsHeader timeframe={timeframe} onTimeframeChange={setTimeframe} />
        <VariantSalesChart data={data.topSelling} />
        <InventoryRiskTable data={data.inventoryRisks} />
        <ReturnRateChart data={data.returnRates} />
        <ProductLifecycleChart data={data.lifecycle} />
      </div>
    </AppLayout>
  )
}

export default ProductsPage
