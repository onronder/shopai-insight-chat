
// Mock data for order volume chart
export const orderVolumeData = [
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
export const orderStatusData = [
  { name: "Fulfilled", value: 68 },
  { name: "Open", value: 15 },
  { name: "Cancelled", value: 12 },
  { name: "Returned", value: 5 },
];

// Chart colors
export const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

// AOV over time data
export const aovData = [
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
export const discountedOrdersData = [
  { id: "#1089", total: 324.99, discount: 30, customer: "Jane Cooper" },
  { id: "#1072", total: 189.50, discount: 25, customer: "Wade Warren" },
  { id: "#1063", total: 245.75, discount: 20, customer: "Esther Howard" },
  { id: "#1055", total: 178.25, discount: 15, customer: "Cameron Williamson" },
  { id: "#1042", total: 215.00, discount: 15, customer: "Brooklyn Simmons" },
];

// Fulfillment delays data
export const fulfillmentDelaysData = [
  { day: "Same Day", value: 45 },
  { day: "1 Day", value: 28 },
  { day: "2 Days", value: 15 },
  { day: "3 Days", value: 8 },
  { day: "4+ Days", value: 4, delayed: true },
];
