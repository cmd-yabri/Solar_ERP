import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChartData, useFinancialSummary } from '@/hooks/useInvoice';
import { useSalesOrders } from '@/hooks/useSales';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export default function Financials() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('weekly');
  const { data: chartData, isLoading: chartLoading } = useChartData();
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const { data: salesOrders } = useSalesOrders();

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
  };

  const income = parseFloat(summary?.total_revenue || '0');
  const cogs = parseFloat(summary?.total_cogs || '0');
  const freelanceCosts = parseFloat(summary?.total_freelance_costs || '0');
  const opExpenses = parseFloat(summary?.total_operational_expenses || '0');
  const outcome = cogs + freelanceCosts + opExpenses;
  const netProfit = parseFloat(summary?.net_profit || '0');

  const transformedChartData = chartData?.map(item => ({
    period: item.date,
    income: parseFloat(item.total_revenue),
    outcome: parseFloat(item.total_cogs) + parseFloat(item.total_freelance_costs) + parseFloat(item.total_operational_expenses),
    profit: parseFloat(item.net_profit),
  })) || [];

  const transactions = salesOrders?.slice(0, 5).map(order => ({
    id: order.id,
    type: 'sale' as const,
    description: `SO-${order.id} - ${order.client_name}`,
    amount: parseFloat(order.grand_total),
    date: order.date.split('T')[0],
  })) || [];

  const isLoading = chartLoading || summaryLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Financials</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Financials</h1>
        <p className="text-muted-foreground mt-1">Track income, expenses, and profit</p>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-muted rounded-xl w-fit">
        {periods.map(period => (
          <Button key={period.value} variant={selectedPeriod === period.value ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedPeriod(period.value)} className={cn("h-9 px-4", selectedPeriod === period.value && "shadow-sm")}>
            {period.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-accent text-accent-foreground"><ArrowUpRight className="w-5 h-5" /></div>
            <div><p className="text-sm text-muted-foreground">Total Income</p></div>
          </div>
          <p className="text-3xl font-bold text-primary">{formatCurrency(income)}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive"><ArrowDownLeft className="w-5 h-5" /></div>
            <div><p className="text-sm text-muted-foreground">Total Expenses</p></div>
          </div>
          <p className="text-3xl font-bold text-destructive">{formatCurrency(outcome)}</p>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">COGS:</span><span>{formatCurrency(cogs)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Freelance:</span><span>{formatCurrency(freelanceCosts)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Operations:</span><span>{formatCurrency(opExpenses)}</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-6 text-primary-foreground">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary-foreground/20"><DollarSign className="w-5 h-5" /></div>
            <div><p className="text-sm text-primary-foreground/80">Net Profit</p></div>
          </div>
          <p className="text-4xl font-bold">{formatCurrency(netProfit)}</p>
          {income > 0 && <p className="text-sm text-primary-foreground/80 mt-4">Profit Margin: <span className="font-semibold">{((netProfit / income) * 100).toFixed(1)}%</span></p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Revenue vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [formatCurrency(value)]} />
                <Bar dataKey="income" name="Income" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outcome" name="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Profit Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transformedChartData}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [formatCurrency(value), 'Profit']} />
                <Area type="monotone" dataKey="profit" stroke="hsl(160, 84%, 39%)" strokeWidth={2} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30">
                <td className="px-4 py-4 text-sm text-muted-foreground">{t.date}</td>
                <td className="px-4 py-4 text-sm">{t.description}</td>
                <td className="px-4 py-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground"><ArrowUpRight className="w-3 h-3" />Sale</span></td>
                <td className="px-4 py-4 text-sm font-semibold text-right text-primary">+{formatCurrency(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
