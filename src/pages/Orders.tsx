
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

// Mock data for order volume chart
const orderVolumeData = [
  { date: "04/01", orders: 28 },
  { date: "04/02", orders: 32 },
  { date: "04/03", orders: 25 },
  { date: "04/04", orders: 30 },
  { date: "04/05", orders: 45, isSale: true }, // Sale day
  { date: "04/06", orders: 52, isSale: true }, // Sale day
  { date: "04/07", orders: 41, isSale: true }, // Sale day
  { date: "04/08", orders: 34 },
  { date: "04/09", orders: 29 },
  { date: "04/10", orders: 31 },
  { date: "04/11", orders: 27 },
  { date: "04/12", orders: 32 },
  { date: "04/13", orders: 29 },
  { date: "04/14", orders: 38 },
];

// Order status breakdown data
const orderStatusData = [
  { name: "Fulfilled", value: 68 },
  { name: "Open", value: 15 },
  { name: "Cancelled", value: 12 },
  { name: "Returned", value: 5 },
];

// AOV over time data
const aovData = [
  { date: "04/01", value: 78.45 },
  { date: "04/02", value: 82.12 },
  { date: "04/03", value: 75.34 },
  { date: "04/04", value: 79.00 },
  { date: "04/05", value: 68.25 }, // Sale day = lower AOV
  { date: "04/06", value: 65.18 }, // Sale day = lower AOV
  { date: "04/07", value: 71.36 }, // Sale day = lower AOV
  { date: "04/08", value: 83.22 },
  { date: "04/09", value: 85.47 },
  { date: "04/10", value: 81.89 },
  { date: "04/11", value: 82.54 },
  { date: "04/12", value: 84.76 },
  { date: "04/13", value: 83.95 },
  { date: "04/14", value: 86.23 },
];

// Top discounted orders data
const discountedOrdersData = [
  { id: "#1089", total: 324.99, discount: 30, customer: "Jane Cooper" },
  { id: "#1072", total: 189.50, discount: 25, customer: "Wade Warren" },
  { id: "#1063", total: 245.75, discount: 20, customer: "Esther Howard" },
  { id: "#1055", total: 178.25, discount: 15, customer: "Cameron Williamson" },
  { id: "#1042", total: 215.00, discount: 15, customer: "Brooklyn Simmons" },
];

// Fulfillment delays data
const fulfillmentDelaysData = [
  { day: "Same Day", value: 45 },
  { day: "1 Day", value: 28 },
  { day: "2 Days", value: 15 },
  { day: "3 Days", value: 8 },
  { day: "4+ Days", value: 4, delayed: true },
];

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

const OrdersPage: React.FC = () => {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders & Fulfillment</h2>
          <p className="text-muted-foreground">Track your order performance and fulfillment metrics</p>
        </div>
        <Select defaultValue="last14">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7">Last 7 days</SelectItem>
            <SelectItem value="last14">Last 14 days</SelectItem>
            <SelectItem value="last30">Last 30 days</SelectItem>
            <SelectItem value="last90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Volume</CardTitle>
          <CardDescription>Daily orders with sale period highlights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  // Color based on whether it's a sale day
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                {/* Additional elements to highlight sale days */}
                {orderVolumeData.map((entry, index) => (
                  entry.isSale && (
                    <Area
                      key={`sale-${index}`}
                      type="monotone"
                      dataKey="orders"
                      data={[orderVolumeData[index]]}
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.5}
                      strokeWidth={2}
                    />
                  )
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 justify-center mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#8884d8]"></div>
              <span className="text-xs">Regular days</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="text-xs">Sale days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {orderStatusData.map((status, index) => (
                <div key={index} className="flex flex-col items-center p-2 rounded-md border">
                  <div 
                    className="w-3 h-3 rounded-full mb-1" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs font-medium">{status.name}</span>
                  <span className="text-xs text-muted-foreground">{status.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Daily AOV trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aovData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[60, 90]} tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => {
                    if (typeof value === 'number') {
                      return [`$${value.toFixed(2)}`, "AOV"];
                    }
                    return [`$${value}`, "AOV"];
                  }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Discounted Orders</CardTitle>
            <CardDescription>Orders with highest discount percentages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-auto">
              {discountedOrdersData.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-muted-foreground">{order.customer}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">${order.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <Badge className="bg-amber-500">{order.discount}% off</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Fulfillment Delays</CardTitle>
              <CardDescription>Time from order to fulfillment</CardDescription>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fulfillmentDelaysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {fulfillmentDelaysData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.delayed ? "#EF4444" : "#8884d8"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <p><span className="font-medium">Warning:</span> 4% of your orders take 4+ days to fulfill. Consider optimizing your fulfillment process to improve customer satisfaction and reduce support inquiries.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersPage;
