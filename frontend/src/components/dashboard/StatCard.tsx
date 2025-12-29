import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({ title, value, icon, trend, variant = 'default', className }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    success: 'bg-card border-r-4 border-r-primary border-t-0 border-l-0 border-b-0',
    warning: 'bg-card border-r-4 border-r-warning border-t-0 border-l-0 border-b-0',
    danger: 'bg-card border-r-4 border-r-destructive border-t-0 border-l-0 border-b-0',
  };

  return (
    <div 
      className={cn(
        "rounded-xl border p-6 stat-card-shadow hover-lift",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-primary" : "text-destructive"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <span className="text-muted-foreground font-normal">مقارنة بالفترة السابقة</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-accent text-accent-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
}
