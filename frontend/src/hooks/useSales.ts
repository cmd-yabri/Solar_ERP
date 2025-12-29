import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/salesService';
import { SalesOrderCreate } from '@/types/api';

export const useSalesOrders = () => {
  return useQuery({
    queryKey: ['salesOrders'],
    queryFn: salesService.getSalesOrders,
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order: SalesOrderCreate) => salesService.createSalesOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
    },
  });
};

export const useFinalizeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salesService.finalizeOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
