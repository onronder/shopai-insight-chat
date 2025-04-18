import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"

export interface CustomerSegment {
  segment: string
  count: number
  avg_order_value: number
  percentage: number
}

export interface LtvDistribution {
  bucket: string
  count: number
  percentage: number
  min_value: number
  max_value: number
}

export interface ChurnCandidate {
  customer_id: string
  email: string
  days_since_last_order: number
  orders_count: number
  total_spent: number
  risk_score: number
}

export interface RepeatCustomer {
  count: number
  percentage: number
  type: "new" | "repeat"
}

const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetcher = async (url: string) => {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(url, { headers })
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error")
      throw new Error(`Failed to fetch ${url}: ${res.status} - ${errorText}`)
    }
    
    return res.json()
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error
  }
}

export const useCustomersData = () => {
  const [timeframe, setTimeframe] = useState<string>("last30")
  const [minChurnRisk, setMinChurnRisk] = useState<number>(60)
  
  // Fetch customer segments data
  const segments = useQuery<CustomerSegment[]>({
    queryKey: ["customer_segments", timeframe],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_customer_segments?timeframe=${timeframe}`)
        
        // Handle different response structures
        let segmentsData: any[] = []
        
        if (Array.isArray(data)) {
          segmentsData = data
        } else if (data && data.segments && Array.isArray(data.segments)) {
          segmentsData = data.segments
        } else {
          console.warn("Unexpected data structure from metrics_customer_segments:", data)
          return []
        }
        
        // Ensure data has expected format and add percentage field
        const segmentsWithPercentage = segmentsData.map(segment => {
          // Parse values to ensure they're numbers
          const count = typeof segment.count === 'number' ? segment.count : 
                       (typeof segment.customer_count === 'number' ? segment.customer_count : 
                       parseInt(segment.count) || parseInt(segment.customer_count) || 0)
                       
          const avgOrderValue = typeof segment.avg_order_value === 'number' ? segment.avg_order_value : 
                              parseFloat(segment.avg_order_value) || 0
          
          return {
            segment: segment.segment || "Unknown",
            count,
            avg_order_value: avgOrderValue,
            // Percentage will be calculated after totaling
            percentage: 0
          }
        })
        
        // Calculate total and percentages
        const total = segmentsWithPercentage.reduce((sum, s) => sum + s.count, 0)
        
        if (total > 0) {
          return segmentsWithPercentage.map(s => ({
            ...s,
            percentage: Math.round((s.count / total) * 100)
          }))
        }
        
        return segmentsWithPercentage
      } catch (error) {
        console.error("Error in metrics_customer_segments:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
  
  // Fetch LTV distribution data
  const ltvDistribution = useQuery<LtvDistribution[]>({
    queryKey: ["ltv_distribution", timeframe],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_ltv_distribution?timeframe=${timeframe}`)
        
        // Handle different response structures
        let bucketsData: any[] = []
        
        if (Array.isArray(data)) {
          bucketsData = data
        } else if (data && data.buckets && Array.isArray(data.buckets)) {
          bucketsData = data.buckets
        } else {
          console.warn("Unexpected data structure from metrics_ltv_distribution:", data)
          return []
        }
        
        // Ensure data has expected format and add percentage field
        const distributionWithPercentage = bucketsData.map(bucket => {
          // Parse values to ensure they're numbers
          const count = typeof bucket.count === 'number' ? bucket.count : 
                       (typeof bucket.customer_count === 'number' ? bucket.customer_count : 
                       parseInt(bucket.count) || parseInt(bucket.customer_count) || 0)
          
          // Extract min and max values from bucket name if not explicitly provided
          let minValue = typeof bucket.min_value === 'number' ? bucket.min_value : parseFloat(bucket.min_value) || 0
          let maxValue = typeof bucket.max_value === 'number' ? bucket.max_value : parseFloat(bucket.max_value) || 0
          
          // Try to extract from bucket name/range if not directly available
          const bucketName = bucket.bucket || bucket.name || bucket.ltv_range || "Unknown"
          if ((minValue === 0 && maxValue === 0) && bucketName) {
            const matches = bucketName.match(/\$(\d+)(?:-\$(\d+))?/)
            if (matches) {
              minValue = parseInt(matches[1]) || 0
              maxValue = matches[2] ? parseInt(matches[2]) : minValue * 2
            }
          }
          
          return {
            bucket: bucketName,
            count,
            min_value: minValue,
            max_value: maxValue,
            // Percentage will be calculated after totaling
            percentage: 0
          }
        })
        
        // Calculate total and percentages
        const total = distributionWithPercentage.reduce((sum, b) => sum + b.count, 0)
        
        if (total > 0) {
          return distributionWithPercentage.map(b => ({
            ...b,
            percentage: Math.round((b.count / total) * 100)
          }))
        }
        
        return distributionWithPercentage
      } catch (error) {
        console.error("Error in metrics_ltv_distribution:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
  
  // Fetch churn candidates data
  const churnCandidates = useQuery<ChurnCandidate[]>({
    queryKey: ["churn_candidates", minChurnRisk],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_churn_candidates?min_risk=${minChurnRisk}`)
        
        // Handle different response structures
        let candidatesData: any[] = []
        
        if (Array.isArray(data)) {
          candidatesData = data
        } else if (data && data.candidates && Array.isArray(data.candidates)) {
          candidatesData = data.candidates
        } else {
          console.warn("Unexpected data structure from metrics_churn_candidates:", data)
          return []
        }
        
        // Normalize and transform data
        return candidatesData.map(candidate => ({
          customer_id: candidate.customer_id || candidate.id || "",
          email: candidate.email || "unknown@example.com",
          days_since_last_order: typeof candidate.days_since_last_order === 'number' ? 
                               candidate.days_since_last_order : 
                               parseInt(candidate.days_since_last_order) || 0,
          orders_count: typeof candidate.orders_count === 'number' ? 
                      candidate.orders_count : 
                      (typeof candidate.order_count === 'number' ? 
                      candidate.order_count : 
                      parseInt(candidate.orders_count) || parseInt(candidate.order_count) || 0),
          total_spent: typeof candidate.total_spent === 'number' ? 
                     candidate.total_spent :
                     (typeof candidate.lifetime_value === 'number' ? 
                     candidate.lifetime_value : 
                     parseFloat(candidate.total_spent) || parseFloat(candidate.lifetime_value) || 0),
          risk_score: typeof candidate.risk_score === 'number' ? 
                    candidate.risk_score : 
                    parseInt(candidate.risk_score) || 0
        }))
      } catch (error) {
        console.error("Error in metrics_churn_candidates:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 15 * 60 * 1000 // 15 minutes
  })
  
  // Fetch repeat customers data
  const repeatCustomers = useQuery<RepeatCustomer[]>({
    queryKey: ["repeat_customers", timeframe],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_repeat_ratio?timeframe=${timeframe}`)
        
        // Check if we have the expected data structure
        if (!data || ((!data.new_count || data.new_count === undefined) && 
                      (!data.repeat_count || data.repeat_count === undefined))) {
          console.warn("Unexpected data structure from metrics_repeat_ratio:", data)
          
          // Check if we have alternative structure with repeat/new arrays
          if (data && data.repeat && Array.isArray(data.repeat) && data.new && Array.isArray(data.new)) {
            // Calculate totals from the arrays
            const repeatTotal = data.repeat.reduce((sum: number, item: any) => sum + (parseInt(item.count) || 0), 0)
            const newTotal = data.new.reduce((sum: number, item: any) => sum + (parseInt(item.count) || 0), 0)
            
            const total = repeatTotal + newTotal
            
            return [
              {
                count: newTotal,
                percentage: total > 0 ? Math.round((newTotal / total) * 100) : 0,
                type: "new" as const
              },
              {
                count: repeatTotal,
                percentage: total > 0 ? Math.round((repeatTotal / total) * 100) : 0,
                type: "repeat" as const
              }
            ]
          }
          
          return []
        }
        
        // Parse values to ensure they're numbers
        const newCount = typeof data.new_count === 'number' ? 
                       data.new_count : 
                       parseInt(data.new_count) || 0
                       
        const repeatCount = typeof data.repeat_count === 'number' ? 
                          data.repeat_count : 
                          parseInt(data.repeat_count) || 0
        
        const total = newCount + repeatCount
        
        // Create percentage and return in consistent format
        return [
          {
            count: newCount,
            percentage: total > 0 ? Math.round((newCount / total) * 100) : 0,
            type: "new" as const
          },
          {
            count: repeatCount,
            percentage: total > 0 ? Math.round((repeatCount / total) * 100) : 0,
            type: "repeat" as const
          }
        ]
      } catch (error) {
        console.error("Error in metrics_repeat_ratio:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
  
  // Returns a Promise that resolves when all refetches are done
  const refetchAll = async () => {
    try {
      const results = await Promise.all([
        segments.refetch(),
        ltvDistribution.refetch(),
        churnCandidates.refetch(),
        repeatCustomers.refetch()
      ])
      
      console.log("All customers data refetched successfully")
      return results
    } catch (error) {
      console.error("Error refetching customers data:", error)
      throw error
    }
  }

  const isLoading = segments.isLoading || ltvDistribution.isLoading || 
                   churnCandidates.isLoading || repeatCustomers.isLoading
  
  const isFetching = segments.isFetching || ltvDistribution.isFetching || 
                    churnCandidates.isFetching || repeatCustomers.isFetching
  
  // Aggregate all errors
  const error = segments.error || ltvDistribution.error || 
               churnCandidates.error || repeatCustomers.error
  
  const errorMessage = error ? (error instanceof Error ? error.message : "Unknown error") : null

  // Check if we have any data
  const hasData = !!segments.data?.length || !!ltvDistribution.data?.length || 
                 !!churnCandidates.data?.length || !!repeatCustomers.data?.length

  // Calculate totals for each query result with data
  const customerTotal = segments.data?.reduce((sum, segment) => sum + segment.count, 0) || 0
  const ltvTotal = ltvDistribution.data?.reduce((sum, bucket) => sum + bucket.count, 0) || 0
  
  return {
    isLoading,
    isFetching,
    error,
    errorMessage,
    segmentsData: segments.data || [],
    ltvDistributionData: ltvDistribution.data || [],
    churnCandidatesData: churnCandidates.data || [],
    repeatCustomersData: repeatCustomers.data || [],
    customerTotal,
    ltvTotal,
    refetch: refetchAll,
    timeframe,
    setTimeframe: (newTimeframe: string) => setTimeframe(newTimeframe),
    minChurnRisk,
    setMinChurnRisk: (risk: number) => setMinChurnRisk(risk),
    hasData,
    status: {
      segments: segments.status,
      ltvDistribution: ltvDistribution.status,
      churnCandidates: churnCandidates.status,
      repeatCustomers: repeatCustomers.status
    }
  }
}