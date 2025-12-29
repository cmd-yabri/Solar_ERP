import apiClient from '@/lib/apiClient';
import { PurchaseOrder, PurchaseOrderCreate, POPayment, POPaymentCreate } from '@/types/api';

export const purchaseService = {
  // Get all purchase orders
  getPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<PurchaseOrder[]>('/api/purchases/po/');
    return response.data;
  },

  // Create purchase order
  createPurchaseOrder: async (order: PurchaseOrderCreate): Promise<PurchaseOrder> => {
    const response = await apiClient.post<PurchaseOrder>('/api/purchases/po/', order);
    return response.data;
  },

  // Add payment to purchase order
  addPayment: async (poId: number, payment: POPaymentCreate): Promise<POPayment> => {
    const response = await apiClient.post<POPayment>(
      `/api/purchases/po/${poId}/add-payment/`,
      payment
    );
    return response.data;
  },

  // Receive purchase order (mark as received, update inventory)
  receivePurchaseOrder: async (poId: number): Promise<PurchaseOrder> => {
    const response = await apiClient.post<PurchaseOrder>(
      `/api/purchases/po/${poId}/recieve-purchase-order/`
    );
    return response.data;
  },
};
