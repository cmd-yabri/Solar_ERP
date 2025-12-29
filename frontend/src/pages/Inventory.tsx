import { useState } from 'react';
import { Search, Package, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProducts, useCreateProduct } from '@/hooks/useInventory';
import { Skeleton } from '@/components/ui/skeleton';

export default function Inventory() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: null as number | null,
    unit_cost: '',
    selling_price: '',
    current_stock: 0,
    reorder_threshold: 10,
  });
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'panels', label: 'Solar Panels' },
    { value: 'batteries', label: 'Batteries' },
    { value: 'inverters', label: 'Inverters' },
    { value: 'accessories', label: 'Accessories' },
  ];

  const inventory = products || [];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
      item.category_name?.toLowerCase().includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => 
    (item.current_stock || 0) <= (item.reorder_threshold || 0)
  );

  const totalValue = inventory.reduce((sum, item) => {
    const cost = parseFloat(item.unit_cost) || 0;
    const stock = item.current_stock || 0;
    return sum + (stock * cost);
  }, 0);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getCategoryBadge = (categoryName: string) => {
    const name = categoryName?.toLowerCase() || '';
    let style = 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    let label = categoryName || 'Other';
    
    if (name.includes('panel')) {
      style = 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      label = 'Panel';
    } else if (name.includes('batter')) {
      style = 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      label = 'Battery';
    } else if (name.includes('inverter')) {
      style = 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      label = 'Inverter';
    }
    
    return <Badge variant="outline" className={style}>{label}</Badge>;
  };

  const handleAddItem = async () => {
    try {
      await createProduct.mutateAsync({
        name: newItem.name,
        category: newItem.category,
        unit_cost: newItem.unit_cost,
        selling_price: newItem.selling_price,
        current_stock: newItem.current_stock,
        reorder_threshold: newItem.reorder_threshold,
      });
      setIsDialogOpen(false);
      setNewItem({
        name: '',
        category: null,
        unit_cost: '',
        selling_price: '',
        current_stock: 0,
        reorder_threshold: 10,
      });
      toast({
        title: "Product Added",
        description: `${newItem.name} has been added to inventory.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-1">Loading inventory data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your solar equipment inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="solar" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product to Inventory</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input 
                  placeholder="e.g., Solar Panel 400W"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input 
                    type="number"
                    value={newItem.current_stock || ''}
                    onChange={(e) => setNewItem({ ...newItem, current_stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Cost ($)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={newItem.unit_cost}
                    onChange={(e) => setNewItem({ ...newItem, unit_cost: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Selling Price ($)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={newItem.selling_price}
                    onChange={(e) => setNewItem({ ...newItem, selling_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Level</Label>
                  <Input 
                    type="number"
                    value={newItem.reorder_threshold}
                    onChange={(e) => setNewItem({ ...newItem, reorder_threshold: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button 
                variant="solar" 
                className="w-full" 
                onClick={handleAddItem}
                disabled={!newItem.name || createProduct.isPending}
              >
                {createProduct.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add to Inventory
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 stat-card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent text-accent-foreground">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 stat-card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 stat-card-shadow">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              lowStockItems.length > 0 ? "bg-warning/10 text-warning" : "bg-accent text-accent-foreground"
            )}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search inventory..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Unit Cost</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total Value</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, index) => {
                  const isLowStock = (item.current_stock || 0) <= (item.reorder_threshold || 0);
                  const unitCost = parseFloat(item.unit_cost) || 0;
                  const stock = item.current_stock || 0;
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-4 text-sm font-medium text-foreground">{item.name}</td>
                      <td className="px-4 py-4">{getCategoryBadge(item.category_name)}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn(
                          "font-medium",
                          isLowStock ? "text-warning" : "text-foreground"
                        )}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                        {formatCurrency(unitCost)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-foreground">
                        {formatCurrency(stock * unitCost)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isLowStock ? (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-accent text-accent-foreground">
                            In Stock
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
