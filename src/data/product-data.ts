
// Mock data for top selling products
export const topSellingProductsData = [
  { name: "Organic Cotton T-Shirt", units: 245, revenue: 12250 },
  { name: "Premium Yoga Mat", units: 187, revenue: 13090 },
  { name: "Eco-Friendly Water Bottle", units: 156, revenue: 5460 },
  { name: "Wireless Earbuds", units: 132, revenue: 15840 },
  { name: "Minimalist Watch", units: 98, revenue: 19600 },
  { name: "Sustainable Backpack", units: 87, revenue: 8700 },
  { name: "Fitness Tracker", units: 76, revenue: 11400 },
  { name: "Bamboo Toothbrush Set", units: 67, revenue: 1675 },
];

// Inventory at risk data
export const inventoryAtRiskData = [
  { name: "Vintage Denim Jacket", stock: 5, daysSinceLastSale: 45, critical: true },
  { name: "Designer Sunglasses", stock: 3, daysSinceLastSale: 38, critical: true },
  { name: "Leather Wallet", stock: 12, daysSinceLastSale: 32, critical: false },
  { name: "Cashmere Scarf", stock: 7, daysSinceLastSale: 30, critical: false },
  { name: "Limited Edition Sneakers", stock: 2, daysSinceLastSale: 25, critical: true },
];

// Return rate by product data
export const returnRateData = [
  { name: "Skinny Jeans", rate: 12.5 },
  { name: "Winter Boots", rate: 8.7 },
  { name: "Summer Dress", rate: 6.2 },
  { name: "Wireless Earbuds", rate: 5.8 },
  { name: "Smart Watch", rate: 4.3 },
  { name: "Running Shoes", rate: 3.1 },
  { name: "Organic Cotton T-Shirt", rate: 1.8 },
];

// Variant sales breakdown data
export const variantSalesData = [
  { 
    name: "Organic Cotton T-Shirt", 
    "Small": 45, 
    "Medium": 120, 
    "Large": 65, 
    "X-Large": 15 
  },
  { 
    name: "Premium Yoga Mat", 
    "Blue": 45, 
    "Pink": 52, 
    "Black": 75, 
    "Green": 15 
  },
  { 
    name: "Eco-Friendly Water Bottle", 
    "500ml": 86, 
    "750ml": 55, 
    "1L": 15 
  },
];

// Product lifecycle data
export const productLifecycleData = [
  { month: "Jan", new: 15, trending: 8, declining: 3 },
  { month: "Feb", new: 12, trending: 10, declining: 5 },
  { month: "Mar", new: 8, trending: 12, declining: 7 },
  { month: "Apr", new: 10, trending: 15, declining: 6 },
  { month: "May", new: 7, trending: 18, declining: 9 },
  { month: "Jun", new: 9, trending: 16, declining: 12 },
];
