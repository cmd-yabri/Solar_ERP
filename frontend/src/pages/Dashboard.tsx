import { DollarSign, TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductSalesChart } from '@/components/dashboard/ProductSalesChart';
import { ProfitTrendsChart } from '@/components/dashboard/ProfitTrendsChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useDashboard, useChartData } from '@/hooks/useInvoice';
import { useProducts } from '@/hooks/useInventory';
import { useSalesOrders } from '@/hooks/useSales';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: chartData, isLoading: chartLoading } = useChartData();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: salesOrders, isLoading: salesLoading } = useSalesOrders();

  const lowStockItems = products?.filter(item => 
    (item.current_stock || 0) <= (item.reorder_threshold || 0)
  ) || [];

  const pendingOrders = salesOrders?.filter(order => !order.is_finalized).length || 0;

  const formatCurrency = (amount: string | number | undefined) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Transform chart data for components
  const profitTrendsData = chartData?.map(item => ({
    period: item.date,
    profit: parseFloat(item.net_profit),
    revenue: parseFloat(item.total_revenue),
    costs: parseFloat(item.total_cogs) + parseFloat(item.total_freelance_costs) + parseFloat(item.total_operational_expenses),
  })) || [];

  // Aggregate product sales from products data
  const productSalesData = [
    { name: 'Solar Panels', sales: products?.filter(p => p.category_name?.toLowerCase().includes('panel')).length || 0, revenue: 0 },
    { name: 'Batteries', sales: products?.filter(p => p.category_name?.toLowerCase().includes('batter')).length || 0, revenue: 0 },
    { name: 'Inverters', sales: products?.filter(p => p.category_name?.toLowerCase().includes('inverter')).length || 0, revenue: 0 },
    { name: 'Accessories', sales: products?.filter(p => !['panel', 'batter', 'inverter'].some(cat => p.category_name?.toLowerCase().includes(cat))).length || 0, revenue: 0 },
  ];

  // Create transactions from sales orders
  const transactions = salesOrders?.slice(0, 5).map(order => ({
    id: String(order.id),
    type: 'sale' as const,
    description: `SO-${order.id} - ${order.client_name}`,
    amount: parseFloat(order.grand_total),
    date: order.date.split('T')[0],
  })) || [];

  const isLoading = dashboardLoading || chartLoading || productsLoading || salesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Loading your solar business overview...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const totalRevenue = dashboardData?.total_revenue || '0';
  const netProfit = dashboardData?.net_profit || '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your solar business.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 12.5, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 8.2, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Pending Orders"
          value={String(pendingOrders)}
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={{ value: pendingOrders, isPositive: true }}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={lowStockItems.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductSalesChart data={productSalesData} />
        <ProfitTrendsChart data={profitTrendsData} />
      </div>

      {/* Recent Activity */}
      <RecentActivity transactions={transactions} />
    </div>
  );
}
