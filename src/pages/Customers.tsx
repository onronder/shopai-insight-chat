import React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useCustomersData } from "@/hooks/useCustomersData"
import { LoadingState } from "@/components/common/LoadingState"
import { ErrorState } from "@/components/ui/ErrorState"
import { CustomerSegmentsTable } from "@/components/customers/CustomerSegmentsTable"
import { LtvDistributionChart } from "@/components/customers/LtvDistributionChart"
import { ChurnForecastChart } from "@/components/customers/ChurnForecastChart"
import { BestCustomers } from "@/components/customers/BestCustomers"
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner"

const CustomersPage: React.FC = () => {
  const { segments, ltv, churn, loyalty, isLoading, error } = useCustomersData()

  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <LoadingState message="Loading customer data..." />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState title="Failed to load customer insights" description={error.message} />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <SyncStatusBanner />
      <div className="grid gap-4">
        <CustomerSegmentsTable data={segments.data || []} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LtvDistributionChart data={ltv.data || []} />
          <ChurnForecastChart data={churn.data || []} />
        </div>
        <BestCustomers data={loyalty.data || { repeat_customers: 0, new_customers: 0 }} />
      </div>
    </AppLayout>
  )
}

export default CustomersPage