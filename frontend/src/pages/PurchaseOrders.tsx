import { useState } from 'react';
import { Plus, Search, Pencil, FileDown, CheckCircle, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { usePurchaseOrders, useCreatePurchaseOrder, useAddPayment, useReceivePurchaseOrder } from '@/hooks/usePurchases';
import { useProducts } from '@/hooks/useInventory';
import { Skeleton } from '@/components/ui/skeleton';

export default function PurchaseOrders() {
  const { data: orders, isLoading } = usePurchaseOrders();
  const { data: products } = useProducts();
  const createOrder = useCreatePurchaseOrder();
  const addPayment = useAddPayment();
  const receiveOrder = useReceivePurchaseOrder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; poId: number | null }>({ open: false, poId: null });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newOrder, setNewOrder] = useState({
    supplier: 1,
    items: [{ product: 0, quantity: 1, unit_cost: '' }],
  });
  const { toast } = useToast();

  const purchaseOrders = orders || [];
  const inventory = products || [];

  const filteredOrders = purchaseOrders.filter(order => 
    order.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(order.id).includes(searchQuery)
  );

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-accent text-accent-foreground',
      partial: 'bg-warning/10 text-warning border-warning/20',
      unpaid: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge variant="outline" className={styles[status.toLowerCase()] || styles.unpaid}>{status}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const isReceived = status === 'RECEIVED';
    return <Badge variant="outline" className={isReceived ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}>
      {isReceived ? 'Received' : status}
    </Badge>;
  };

  const handleSubmit = async () => {
    try {
      await createOrder.mutateAsync({
        supplier: newOrder.supplier,
        items: newOrder.items.filter(i => i.product > 0).map(i => ({
          product: i.product,
          quantity: i.quantity,
          unit_cost: i.unit_cost,
        })),
      });
      setIsDialogOpen(false);
      setNewOrder({ supplier: 1, items: [{ product: 0, quantity: 1, unit_cost: '' }] });
      toast({ title: "Purchase Order Created", description: "Order has been created successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create order.", variant: "destructive" });
    }
  };

  const handleAddPayment = async () => {
    if (!paymentDialog.poId) return;
    try {
      await addPayment.mutateAsync({ poId: paymentDialog.poId, payment: { amount: paymentAmount, date: paymentDate } });
      setPaymentDialog({ open: false, poId: null });
      setPaymentAmount('');
      toast({ title: "Payment Added", description: "Payment has been recorded." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add payment.", variant: "destructive" });
    }
  };

  const handleReceive = async (poId: number) => {
    try {
      await receiveOrder.mutateAsync(poId);
      toast({ title: "Order Received", description: "Inventory has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to receive order.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Purchase Orders</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Manage supplier orders and payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="solar" className="gap-2"><Plus className="w-4 h-4" />Add Purchase Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Supplier ID</Label>
                <Input type="number" value={newOrder.supplier} onChange={(e) => setNewOrder({ ...newOrder, supplier: parseInt(e.target.value) || 1 })} />
              </div>
              {newOrder.items.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 p-3 bg-muted rounded-lg">
                  <Select value={item.product ? String(item.product) : ''} onValueChange={(v) => {
                    const items = [...newOrder.items];
                    const prod = inventory.find(p => p.id === parseInt(v));
                    items[index] = { ...items[index], product: parseInt(v), unit_cost: prod?.unit_cost || '' };
                    setNewOrder({ ...newOrder, items });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                    <SelectContent>{inventory.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => {
                    const items = [...newOrder.items];
                    items[index].quantity = parseInt(e.target.value) || 0;
                    setNewOrder({ ...newOrder, items });
                  }} />
                  <Input placeholder="Unit Cost" value={item.unit_cost} onChange={(e) => {
                    const items = [...newOrder.items];
                    items[index].unit_cost = e.target.value;
                    setNewOrder({ ...newOrder, items });
                  }} />
                </div>
              ))}
              <Button variant="outline" onClick={() => setNewOrder({ ...newOrder, items: [...newOrder.items, { product: 0, quantity: 1, unit_cost: '' }] })}>
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
              <Button variant="solar" className="w-full" onClick={handleSubmit} disabled={createOrder.isPending}>
                {createOrder.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Create Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search orders..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Supplier</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Payment</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30">
                <td className="px-4 py-4 text-sm font-medium">PO-{order.id}</td>
                <td className="px-4 py-4 text-sm">{order.supplier_name}</td>
                <td className="px-4 py-4 text-sm text-right font-medium">{formatCurrency(order.total_cost)}</td>
                <td className="px-4 py-4 text-center">{getPaymentStatusBadge(order.payment_status)}</td>
                <td className="px-4 py-4 text-center">{getOrderStatusBadge(order.status)}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPaymentDialog({ open: true, poId: order.id })}>
                      <CreditCard className="w-4 h-4" />
                    </Button>
                    {order.status !== 'RECEIVED' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleReceive(order.id)} disabled={receiveOrder.isPending}>
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Amount ($)</Label><Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} /></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} /></div>
            <Button variant="solar" className="w-full" onClick={handleAddPayment} disabled={addPayment.isPending}>
              {addPayment.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Add Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
