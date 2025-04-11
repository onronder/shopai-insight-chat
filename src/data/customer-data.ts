
import { Customer, ChurnDataPoint, LtvRange } from "../types/customer-types";

// Mock data for customer segments
export const customers: Customer[] = [
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
export const ltvData: LtvRange[] = [
  { range: "$0-$100", count: 245 },
  { range: "$101-$250", count: 187 },
  { range: "$251-$500", count: 123 },
  { range: "$501-$1000", count: 76 },
  { range: "$1001-$2000", count: 45 },
  { range: "$2001+", count: 28 },
];

// Recent signups data
export const recentSignups: Customer[] = [
  { id: 1, name: "Alex Morgan", email: "alex.morgan@example.com", date: "2023-04-18", firstOrderValue: 124.99, ltv: 124.99 },
  { id: 2, name: "Taylor Swift", email: "taylor.swift@example.com", date: "2023-04-17", firstOrderValue: 79.99, ltv: 79.99 },
  { id: 3, name: "Morgan Freeman", email: "morgan.freeman@example.com", date: "2023-04-16", firstOrderValue: 189.50, ltv: 189.50 },
  { id: 4, name: "Chris Hemsworth", email: "chris.hemsworth@example.com", date: "2023-04-15", firstOrderValue: 57.25, ltv: 57.25 },
  { id: 5, name: "Emma Stone", email: "emma.stone@example.com", date: "2023-04-14", firstOrderValue: 130.00, ltv: 130.00 },
];

// Define separate datasets for actual and projected churn data
export const actualChurnData: ChurnDataPoint[] = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 2.3 },
  { month: "Mar", rate: 2.2 },
  { month: "Apr", rate: 2.5 },
  { month: "May", rate: 2.8 },
];

export const projectedChurnData: ChurnDataPoint[] = [
  // Include the last actual point for continuity
  { month: "May", rate: 2.8 },
  { month: "Jun", rate: 3.1, projected: true },
  { month: "Jul", rate: 3.4, projected: true },
  { month: "Aug", rate: 3.6, projected: true },
];

// Combined data for display
export const churnData: ChurnDataPoint[] = [
  ...actualChurnData,
  { month: "Jun", rate: 3.1, projected: true },
  { month: "Jul", rate: 3.4, projected: true },
  { month: "Aug", rate: 3.6, projected: true },
];

// Best customers data
export const bestCustomers: Customer[] = [
  { id: 1, name: "Cameron Williamson", email: "cameron.williamson@example.com", ltv: 2100 },
  { id: 2, name: "Jenny Wilson", email: "jenny.wilson@example.com", ltv: 1840 },
  { id: 3, name: "Jane Cooper", email: "jane.cooper@example.com", ltv: 1280 },
  { id: 4, name: "Dianne Russell", email: "dianne.russell@example.com", ltv: 1120 },
  { id: 5, name: "Wade Warren", email: "wade.warren@example.com", ltv: 890 },
];
