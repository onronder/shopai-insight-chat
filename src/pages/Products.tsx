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

const ProductsPage: React.FC = () => {
  const { topSelling, isLoading, error } = useProductsData()

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState title="Loading product analytics..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState title="Failed to load product insights" description={error.message} />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Product Insights">
      <div className="grid gap-4">
        <ProductsHeader />
        <VariantSalesChart data={topSelling.data || []} />
        <InventoryRiskTable data={[]} />
        <ReturnRateChart data={[]} />
        <ProductLifecycleChart data={[]} />
      </div>
    </AppLayout>
  )
}

export default ProductsPage