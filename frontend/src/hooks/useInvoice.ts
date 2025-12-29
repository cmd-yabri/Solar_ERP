import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService, reportsService } from '@/services/invoiceService';
import { ExpenseCreate } from '@/types/api';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: invoiceService.getDashboardData,
  });
};

export const useReportsDashboard = () => {
  return useQuery({
    queryKey: ['reportsDashboard'],
    queryFn: reportsService.getDashboardSummary,
  });
};

export const useChartData = () => {
  return useQuery({
    queryKey: ['charts'],
    queryFn: invoiceService.getChartData,
  });
};

export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['financialSummary'],
    queryFn: invoiceService.getFinancialSummary,
  });
};

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: invoiceService.getExpenses,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expense: ExpenseCreate) => invoiceService.createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Reports hooks
export const useWeeklyFinancials = () => {
  return useQuery({
    queryKey: ['financials', 'weekly'],
    queryFn: reportsService.getWeeklyFinancials,
  });
};

export const useMonthlyFinancials = () => {
  return useQuery({
    queryKey: ['financials', 'monthly'],
    queryFn: reportsService.getMonthlyFinancials,
  });
};

export const useQuarterlyFinancials = () => {
  return useQuery({
    queryKey: ['financials', 'quarterly'],
    queryFn: reportsService.getQuarterlyFinancials,
  });
};

export const useYearlyFinancials = () => {
  return useQuery({
    queryKey: ['financials', 'yearly'],
    queryFn: reportsService.getYearlyFinancials,
  });
};
