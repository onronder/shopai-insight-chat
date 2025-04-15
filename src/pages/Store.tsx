import React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useStoreData } from "@/hooks/useStoreData"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/ErrorState"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"   

export default function Store() {
  const { data, isLoading, error } = useStoreData()

  if (isLoading) {
    return (
      <AppLayout title="Store Health & Performance">
        <Skeleton className="h-96 w-full" />
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Store Health & Performance">
        <ErrorState title="Failed to load store metrics" description={error.message} />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Store Health & Performance">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Health Index: {data.overall}/100</CardTitle>
            <CardDescription>
              {data.trend >= 0
                ? `Improved by ${data.trend} points in the last 30 days`
                : `Decreased by ${Math.abs(data.trend)} points in the last 30 days`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.components.map((component) => (
                <Card key={component.name} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-md">{component.name}</CardTitle>
                    <CardDescription className="text-3xl font-bold">
                      {component.score}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {component.issues?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Issues:</p>
                        <ul className="list-disc list-inside text-sm text-red-600">
                          {component.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {component.opportunities?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Opportunities:</p>
                        <ul className="list-disc list-inside text-sm">
                          {component.opportunities.map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
