import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for customer segments
const customers = [
  { 
    id: 1, 
    name: "Jane Cooper", 
    email: "jane.cooper@example.com", 
    ltv: 1280,
    lastOrder: "2023-04-12",
    segment: "high-value" 
  },
  { 
    id: 2, 
    name: "Wade Warren", 
    email: "wade.warren@example.com", 
    ltv: 890,
    lastOrder: "2023-04-05",
    segment: "repeat" 
  },
  { 
    id: 3, 
    name: "Esther Howard", 
    email: "esther.howard@example.com", 
    ltv: 450,
    lastOrder: "2023-01-18",
    segment: "at-risk" 
  },
  { 
    id: 4, 
    name: "Cameron Williamson", 
    email: "cameron.williamson@example.com", 
    ltv: 2100,
    lastOrder: "2023-04-15",
    segment: "high-value" 
  },
  { 
    id: 5, 
    name: "Brooklyn Simmons", 
    email: "brooklyn.simmons@example.com", 
    ltv: 760,
    lastOrder: "2023-03-21",
    segment: "repeat" 
  },
  { 
    id: 6, 
    name: "Leslie Alexander", 
    email: "leslie.alexander@example.com", 
    ltv: 320,
    lastOrder: "2022-12-05",
    segment: "at-risk" 
  },
  { 
    id: 7, 
    name: "Jenny Wilson", 
    email: "jenny.wilson@example.com", 
    ltv: 1840,
    lastOrder: "2023-04-10",
    segment: "high-value" 
  },
];

// LTV distribution data
const ltvData = [
  { range: "$0-$100", count: 245 },
  { range: "$101-$250", count: 187 },
  { range: "$251-$500", count: 123 },
  { range: "$501-$1000", count: 76 },
  { range: "$1001-$2000", count: 45 },
  { range: "$2001+", count: 28 },
];

// Recent signups data
const recentSignups = [
  { id: 1, name: "Alex Morgan", date: "2023-04-18", firstOrderValue: 124.99 },
  { id: 2, name: "Taylor Swift", date: "2023-04-17", firstOrderValue: 79.99 },
  { id: 3, name: "Morgan Freeman", date: "2023-04-16", firstOrderValue: 189.50 },
  { id: 4, name: "Chris Hemsworth", date: "2023-04-15", firstOrderValue: 57.25 },
  { id: 5, name: "Emma Stone", date: "2023-04-14", firstOrderValue: 130.00 },
];

// Churn forecast data
interface ChurnDataPoint {
  month: string;
  rate: number;
  projected?: boolean;
}

const churnData: ChurnDataPoint[] = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 2.3 },
  { month: "Mar", rate: 2.2 },
  { month: "Apr", rate: 2.5 },
  { month: "May", rate: 2.8 },
  { month: "Jun", rate: 3.1, projected: true },
  { month: "Jul", rate: 3.4, projected: true },
  { month: "Aug", rate: 3.6, projected: true },
];

// Best customers data
const bestCustomers = [
  { id: 1, name: "Cameron Williamson", email: "cameron.williamson@example.com", ltv: 2100 },
  { id: 2, name: "Jenny Wilson", email: "jenny.wilson@example.com", ltv: 1840 },
  { id: 3, name: "Jane Cooper", email: "jane.cooper@example.com", ltv: 1280 },
  { id: 4, name: "Dianne Russell", email: "dianne.russell@example.com", ltv: 1120 },
  { id: 5, name: "Wade Warren", email: "wade.warren@example.com", ltv: 890 },
];

// Segment badge styling
const getSegmentBadge = (segment: string) => {
  switch (segment) {
    case "high-value":
      return <Badge className="bg-emerald-500">High Value</Badge>;
    case "repeat":
      return <Badge className="bg-blue-500">Repeat Buyer</Badge>;
    case "at-risk":
      return <Badge className="bg-amber-500">At Risk</Badge>;
    default:
      return <Badge>New</Badge>;
  }
};

const CustomersPage: React.FC = () => {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Intelligence</h2>
          <p className="text-muted-foreground">Analyze your customer base and behavior patterns</p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="high-value">High Value</SelectItem>
            <SelectItem value="repeat">Repeat Buyers</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>View and analyze customer segments based on spending behavior</CardDescription>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="high-value">High-Value</TabsTrigger>
              <TabsTrigger value="repeat">Repeat Buyers</TabsTrigger>
              <TabsTrigger value="at-risk">At-Risk</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lifetime Value</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>${customer.ltv.toFixed(2)}</TableCell>
                  <TableCell>{new Date(customer.lastOrder).toLocaleDateString()}</TableCell>
                  <TableCell>{getSegmentBadge(customer.segment)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>LTV Distribution</CardTitle>
            <CardDescription>Lifetime value spread across customer base</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ltvData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>New customers who recently joined your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSignups.map((customer) => (
                <div key={customer.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {customer.name.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(customer.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${customer.firstOrderValue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">First order</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Churn Forecast</CardTitle>
              <CardDescription>Predicted customer churn for next 3 months</CardDescription>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={churnData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "Churn Rate"]} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Actual"
                    isAnimationActive={false}
                    connectNulls={true}
                    dot={(data) => data.payload.projected ? false : { r: 4, fill: "#8884d8" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Projected"
                    isAnimationActive={false}
                    connectNulls={true}
                    dot={(data) => data.payload.projected ? { r: 4, fill: "#8884d8" } : false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <p><span className="font-medium">AI Insight:</span> Customer churn is projected to increase by 1.1% over the next quarter. Consider implementing a retention campaign targeting at-risk customers, especially those who haven't purchased in 60+ days.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Best Customers</CardTitle>
              <CardDescription>Top 5 customers by lifetime value</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center font-medium mr-4">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </div>
                  <div className="text-lg font-bold">${customer.ltv.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomersPage;
