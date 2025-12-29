import apiClient from '@/lib/apiClient';
import { SalesOrder, SalesOrderCreate } from '@/types/api';

export const salesService = {
  // Get all sales orders
  getSalesOrders: async (): Promise<SalesOrder[]> => {
    const response = await apiClient.get<SalesOrder[]>('/api/orders/sales/');
    return response.data;
  },

  // Create sales order
  createSalesOrder: async (order: SalesOrderCreate): Promise<SalesOrder> => {
    const response = await apiClient.post<SalesOrder>('/api/orders/sales/', order);
    return response.data;
  },

  // Finalize sales order (deduct stock, book revenue)
  finalizeOrder: async (id: number): Promise<SalesOrder> => {
    const response = await apiClient.post<SalesOrder>(`/api/orders/sales/${id}/finalize/`);
    return response.data;
  },
};
