import { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, CheckCircle, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useSalesOrders, useCreateSalesOrder, useFinalizeOrder } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useInventory';
import { Skeleton } from '@/components/ui/skeleton';
import { SalesOrder, OrderItemCreate, FreelanceJobCreate, JobTypeEnum } from '@/types/api';

export default function SalesOrders() {
  const { data: orders, isLoading } = useSalesOrders();
  const { data: products } = useProducts();
  const createOrder = useCreateSalesOrder();
  const finalizeOrder = useFinalizeOrder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    client_name: '',
    client_phone: '',
    items: [] as { product: number; quantity: number; unit_price: string }[],
    freelance_jobs: [] as { job_type: JobTypeEnum; contractor_name: string; cost_to_company: string; charge_to_client: string }[],
  });
  const { toast } = useToast();

  const salesOrders = orders || [];
  const inventory = products || [];

  const filteredOrders = salesOrders.filter(order => 
    order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(order.id).includes(searchQuery)
  );

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (isFinalized: boolean) => {
    if (isFinalized) {
      return <Badge variant="outline" className="bg-accent text-accent-foreground">Completed</Badge>;
    }
    return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
  };

  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product: 0, quantity: 1, unit_price: '0' }],
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const updateItem = (index: number, productId: number) => {
    const product = inventory.find(p => p.id === productId);
    if (product) {
      const updatedItems = [...newOrder.items];
      updatedItems[index] = {
        ...updatedItems[index],
        product: product.id,
        unit_price: product.selling_price || product.unit_cost,
      };
      setNewOrder({ ...newOrder, items: updatedItems });
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], quantity };
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const addFreelanceJob = () => {
    setNewOrder({
      ...newOrder,
      freelance_jobs: [...newOrder.freelance_jobs, { 
        job_type: 'INSTALL' as JobTypeEnum, 
        contractor_name: '', 
        cost_to_company: '0', 
        charge_to_client: '0' 
      }],
    });
  };

  const updateFreelanceJob = (index: number, field: string, value: string) => {
    const updatedJobs = [...newOrder.freelance_jobs];
    updatedJobs[index] = { ...updatedJobs[index], [field]: value };
    setNewOrder({ ...newOrder, freelance_jobs: updatedJobs });
  };

  const removeFreelanceJob = (index: number) => {
    const updatedJobs = newOrder.freelance_jobs.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, freelance_jobs: updatedJobs });
  };

  const calculateSubtotal = () => {
    return newOrder.items.reduce((sum, item) => sum + (item.quantity * parseFloat(item.unit_price || '0')), 0);
  };

  const calculateServiceTotal = () => {
    return newOrder.freelance_jobs.reduce((sum, job) => sum + parseFloat(job.charge_to_client || '0'), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceTotal();
  };

  const handleSubmit = async () => {
    try {
      const orderData = {
        client_name: newOrder.client_name,
        client_phone: newOrder.client_phone,
        items: newOrder.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        freelance_jobs: newOrder.freelance_jobs.map(job => ({
          job_type: job.job_type,
          contractor_name: job.contractor_name,
          cost_to_company: job.cost_to_company,
          charge_to_client: job.charge_to_client,
        })),
      };

      await createOrder.mutateAsync(orderData);
      setIsDialogOpen(false);
      setNewOrder({
        client_name: '',
        client_phone: '',
        items: [],
        freelance_jobs: [],
      });
      toast({
        title: "Order Created",
        description: `Sales order for ${newOrder.client_name} has been created.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create order.",
        variant: "destructive",
      });
    }
  };

  const handleFinalize = async (orderId: number) => {
    try {
      await finalizeOrder.mutateAsync(orderId);
      toast({
        title: "Order Finalized",
        description: "Stock has been deducted and revenue booked.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to finalize order.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (order: SalesOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground mt-1">Loading sales orders...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground mt-1">Manage client projects and installations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="solar" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Sales Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input 
                    placeholder="Enter client name"
                    value={newOrder.client_name}
                    onChange={(e) => setNewOrder({ ...newOrder, client_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="e.g., +1 234 567 8900"
                    value={newOrder.client_phone}
                    onChange={(e) => setNewOrder({ ...newOrder, client_phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                </div>
                {newOrder.items.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-lg text-muted-foreground">
                    No items added yet. Click "Add Item" to start.
                  </div>
                ) : (
                  newOrder.items.map((item, index) => (
                    <div key={index} className="flex items-end gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Product</Label>
                        <Select 
                          value={item.product ? String(item.product) : ''} 
                          onValueChange={(v) => updateItem(index, parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select from inventory" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.map(inv => (
                              <SelectItem key={inv.id} value={String(inv.id)}>
                                {inv.name} ({inv.current_stock || 0} available)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-28 space-y-1">
                        <Label className="text-xs">Unit Price</Label>
                        <Input 
                          value={formatCurrency(item.unit_price)}
                          disabled
                          className="bg-background"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Freelance Jobs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Freelance Jobs (Labor & Installation)</Label>
                  <Button variant="outline" size="sm" onClick={addFreelanceJob}>
                    <Plus className="w-4 h-4 mr-1" /> Add Job
                  </Button>
                </div>
                {newOrder.freelance_jobs.map((job, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 p-3 bg-muted rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Job Type</Label>
                      <Select 
                        value={job.job_type} 
                        onValueChange={(v) => updateFreelanceJob(index, 'job_type', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STEEL">Steel Work</SelectItem>
                          <SelectItem value="ELECTRIC">Electrician</SelectItem>
                          <SelectItem value="INSTALL">Installation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contractor</Label>
                      <Input 
                        placeholder="Name"
                        value={job.contractor_name}
                        onChange={(e) => updateFreelanceJob(index, 'contractor_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cost to Company</Label>
                      <Input 
                        type="number"
                        value={job.cost_to_company}
                        onChange={(e) => updateFreelanceJob(index, 'cost_to_company', e.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Charge to Client</Label>
                        <Input 
                          type="number"
                          value={job.charge_to_client}
                          onChange={(e) => updateFreelanceJob(index, 'charge_to_client', e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeFreelanceJob(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="p-4 bg-accent rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products Subtotal:</span>
                  <span className="font-medium text-foreground">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Services Total:</span>
                  <span className="font-medium text-foreground">{formatCurrency(calculateServiceTotal())}</span>
                </div>
                <div className="flex justify-between text-lg border-t border-border pt-2 mt-2">
                  <span className="font-semibold text-foreground">Grand Total:</span>
                  <span className="font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <Button 
                variant="solar" 
                className="w-full" 
                onClick={handleSubmit} 
                disabled={!newOrder.client_name || newOrder.items.length === 0 || createOrder.isPending}
              >
                {createOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Sales Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No sales orders found. Create your first order to get started.
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <div 
              key={order.id}
              className="bg-card border border-border rounded-xl p-5 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">SO-{order.id}</p>
                  <h3 className="font-semibold text-foreground">{order.client_name}</h3>
                </div>
                {getStatusBadge(order.is_finalized)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {order.client_phone || 'No phone provided'}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="text-foreground">{order.items.length} product(s)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Services:</span>
                  <span className="text-foreground">{formatCurrency(order.service_total)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Grand Total</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(order.grand_total)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {!order.is_finalized && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                      onClick={() => handleFinalize(order.id)}
                      disabled={finalizeOrder.isPending}
                    >
                      {finalizeOrder.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                        View Details
                      </DropdownMenuItem>
                      {!order.is_finalized && (
                        <DropdownMenuItem onClick={() => handleFinalize(order.id)}>
                          Finalize Order
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - SO-{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="font-medium">{selectedOrder.client_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedOrder.client_phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.is_finalized)}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Items</Label>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between p-2 bg-muted rounded">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.freelance_jobs.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Freelance Jobs</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.freelance_jobs.map(job => (
                      <div key={job.id} className="flex justify-between p-2 bg-muted rounded">
                        <span>{job.job_type} - {job.contractor_name}</span>
                        <span className="font-medium">{formatCurrency(job.charge_to_client)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-accent rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Products Total:</span>
                  <span>{formatCurrency(selectedOrder.product_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Services Total:</span>
                  <span>{formatCurrency(selectedOrder.service_total)}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2 font-bold">
                  <span>Grand Total:</span>
                  <span className="text-primary">{formatCurrency(selectedOrder.grand_total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
