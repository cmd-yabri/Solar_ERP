import { PurchaseOrder, SalesOrder, InventoryItem, Transaction } from '@/types';

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplier: 'SunPower Corp',
    totalAmount: 45000,
    paymentStatus: 'paid',
    orderStatus: 'received',
    items: [
      { id: '1', product: 'Solar Panels 400W', quantity: 50, unitPrice: 800 },
      { id: '2', product: 'Mounting Rails', quantity: 100, unitPrice: 50 },
    ],
    payments: [
      { id: 'p1', date: '2024-01-10', amount: 22500, method: 'bank_transfer' },
      { id: 'p2', date: '2024-01-25', amount: 22500, method: 'bank_transfer' },
    ],
    createdAt: '2024-01-05',
  },
  {
    id: 'PO-002',
    supplier: 'BatteryMax Ltd',
    totalAmount: 28000,
    paymentStatus: 'partial',
    orderStatus: 'pending',
    items: [
      { id: '3', product: 'Lithium Battery 10kWh', quantity: 10, unitPrice: 2800 },
    ],
    payments: [
      { id: 'p3', date: '2024-02-01', amount: 14000, method: 'bank_transfer' },
    ],
    createdAt: '2024-01-28',
  },
  {
    id: 'PO-003',
    supplier: 'InverterTech',
    totalAmount: 15600,
    paymentStatus: 'unpaid',
    orderStatus: 'pending',
    items: [
      { id: '4', product: 'Hybrid Inverter 5kW', quantity: 12, unitPrice: 1300 },
    ],
    payments: [],
    createdAt: '2024-02-10',
  },
];

export const mockSalesOrders: SalesOrder[] = [
  {
    id: 'SO-001',
    clientName: 'Green Valley Homes',
    projectName: 'Residential Solar Installation',
    items: [
      { id: '1', productId: 'inv-1', productName: 'Solar Panel 400W', quantity: 12, unitPrice: 950 },
      { id: '2', productId: 'inv-3', productName: 'Hybrid Inverter 5kW', quantity: 1, unitPrice: 1800 },
      { id: '3', productId: 'inv-2', productName: 'Lithium Battery 10kWh', quantity: 2, unitPrice: 3500 },
    ],
    steelworkFees: 2500,
    electricianFees: 3000,
    totalAmount: 24700,
    status: 'completed',
    createdAt: '2024-01-15',
  },
  {
    id: 'SO-002',
    clientName: 'TechPark Industries',
    projectName: 'Commercial Rooftop System',
    items: [
      { id: '4', productId: 'inv-1', productName: 'Solar Panel 400W', quantity: 50, unitPrice: 900 },
      { id: '5', productId: 'inv-3', productName: 'Hybrid Inverter 5kW', quantity: 4, unitPrice: 1750 },
    ],
    steelworkFees: 8000,
    electricianFees: 6000,
    totalAmount: 66000,
    status: 'in_progress',
    createdAt: '2024-02-01',
  },
];

export const mockInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Solar Panel 400W', category: 'panels', quantity: 150, unitPrice: 800, reorderLevel: 50 },
  { id: 'inv-2', name: 'Lithium Battery 10kWh', category: 'batteries', quantity: 25, unitPrice: 2800, reorderLevel: 10 },
  { id: 'inv-3', name: 'Hybrid Inverter 5kW', category: 'inverters', quantity: 8, unitPrice: 1300, reorderLevel: 5 },
  { id: 'inv-4', name: 'Solar Panel 550W', category: 'panels', quantity: 80, unitPrice: 1100, reorderLevel: 30 },
  { id: 'inv-5', name: 'Lithium Battery 5kWh', category: 'batteries', quantity: 40, unitPrice: 1500, reorderLevel: 15 },
  { id: 'inv-6', name: 'String Inverter 3kW', category: 'inverters', quantity: 3, unitPrice: 900, reorderLevel: 5 },
  { id: 'inv-7', name: 'MC4 Connectors Pack', category: 'accessories', quantity: 500, unitPrice: 15, reorderLevel: 100 },
  { id: 'inv-8', name: 'Mounting Rails 2m', category: 'accessories', quantity: 200, unitPrice: 45, reorderLevel: 50 },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', type: 'sale', description: 'SO-001 - Green Valley Homes', amount: 24700, date: '2024-02-15' },
  { id: 't2', type: 'purchase', description: 'PO-002 - BatteryMax Ltd (Partial)', amount: -14000, date: '2024-02-01' },
  { id: 't3', type: 'sale', description: 'SO-002 - TechPark Industries (Deposit)', amount: 33000, date: '2024-02-05' },
  { id: 't4', type: 'purchase', description: 'PO-001 - SunPower Corp', amount: -45000, date: '2024-01-25' },
  { id: 't5', type: 'sale', description: 'Accessory Sale - MC4 Pack', amount: 450, date: '2024-02-12' },
];

export const mockProductSalesData = [
  { name: 'Panels', sales: 156, revenue: 140000 },
  { name: 'Batteries', sales: 42, revenue: 126000 },
  { name: 'Inverters', sales: 28, revenue: 36400 },
  { name: 'Accessories', sales: 320, revenue: 14400 },
];

export const mockProfitTrends = [
  { period: 'Week 1', profit: 12500, revenue: 28000, costs: 15500 },
  { period: 'Week 2', profit: 18200, revenue: 35000, costs: 16800 },
  { period: 'Week 3', profit: 15800, revenue: 32000, costs: 16200 },
  { period: 'Week 4', profit: 22400, revenue: 45000, costs: 22600 },
  { period: 'Week 5', profit: 19600, revenue: 38000, costs: 18400 },
  { period: 'Week 6', profit: 25100, revenue: 52000, costs: 26900 },
];
