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
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

const CustomersPage: React.FC = () => {
  const { segments, ltv, churn, loyalty, isLoading, error } = useCustomersData()

  // Check for specific data loading states
  const segmentsLoading = segments.isLoading
  const ltvLoading = ltv.isLoading
  const churnLoading = churn.isLoading
  const loyaltyLoading = loyalty.isLoading

  // Handle fetch errors
  const segmentsError = segments.error
  const ltvError = ltv.error
  const churnError = churn.error
  const loyaltyError = loyalty.error

  // Function to retry failed data fetches
  const handleRetry = () => {
    if (segmentsError) segments.refetch()
    if (ltvError) ltv.refetch()
    if (churnError) churn.refetch()
    if (loyaltyError) loyalty.refetch()
  }

  // If all data is loading, show a loading state
  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <LoadingState message="Loading customer data..." />
      </AppLayout>
    )
  }

  // If any data fetch had an error, show a comprehensive error state
  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState 
          title="Failed to load customer insights" 
          description={error.message} 
          action={<Button onClick={handleRetry}>Retry</Button>}
        />
      </AppLayout>
    )
  }

  // Check if we have no data at all
  const hasNoData = 
    (!segments.data || segments.data.length === 0) && 
    (!ltv.data || ltv.data.length === 0) && 
    (!churn.data || churn.data.length === 0) && 
    (!loyalty.data)

  if (hasNoData) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No customer data available</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any customer data to display. This could be because you haven't
            connected your store yet or because your store doesn't have any customers.
          </p>
          <Button onClick={handleRetry}>Refresh Data</Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <SyncStatusBanner />
      <div className="grid gap-4">
        {/* Segments Table with loading and error states */}
        {segmentsLoading ? (
          <div className="rounded-lg border p-4"><LoadingState message="Loading segments..." /></div>
        ) : segmentsError ? (
          <div className="rounded-lg border p-4">
            <ErrorState 
              title="Failed to load customer segments" 
              description={segmentsError.message} 
              action={<Button size="sm" onClick={() => segments.refetch()}>Retry</Button>}
            />
          </div>
        ) : (
          <CustomerSegmentsTable data={segments.data || []} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LTV Distribution Chart with loading and error states */}
          {ltvLoading ? (
            <div className="rounded-lg border p-4"><LoadingState message="Loading LTV data..." /></div>
          ) : ltvError ? (
            <div className="rounded-lg border p-4">
              <ErrorState 
                title="Failed to load LTV data" 
                description={ltvError.message} 
                action={<Button size="sm" onClick={() => ltv.refetch()}>Retry</Button>}
              />
            </div>
          ) : (
            <LtvDistributionChart data={ltv.data || []} />
          )}

          {/* Churn Forecast Chart with loading and error states */}
          {churnLoading ? (
            <div className="rounded-lg border p-4"><LoadingState message="Loading churn data..." /></div>
          ) : churnError ? (
            <div className="rounded-lg border p-4">
              <ErrorState 
                title="Failed to load churn data" 
                description={churnError.message} 
                action={<Button size="sm" onClick={() => churn.refetch()}>Retry</Button>}
              />
            </div>
          ) : (
            <ChurnForecastChart data={churn.data || []} />
          )}
        </div>

        {/* Best Customers with loading and error states */}
        {loyaltyLoading ? (
          <div className="rounded-lg border p-4"><LoadingState message="Loading loyalty data..." /></div>
        ) : loyaltyError ? (
          <div className="rounded-lg border p-4">
            <ErrorState 
              title="Failed to load loyalty data" 
              description={loyaltyError.message} 
              action={<Button size="sm" onClick={() => loyalty.refetch()}>Retry</Button>}
            />
          </div>
        ) : (
          <BestCustomers data={loyalty.data || { repeat_customers: 0, new_customers: 0 }} />
        )}
      </div>
    </AppLayout>
  )
}

export default CustomersPage