import apiClient from '@/lib/apiClient';
import { Product, ProductCreate } from '@/types/api';

export const inventoryService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/api/inventory/products/');
    return response.data;
  },

  // Get single product
  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/inventory/products/${id}/`);
    return response.data;
  },

  // Create product
  createProduct: async (product: ProductCreate): Promise<Product> => {
    const response = await apiClient.post<Product>('/api/inventory/products/', product);
    return response.data;
  },

  // Update product
  updateProduct: async (id: number, product: Partial<ProductCreate>): Promise<Product> => {
    const response = await apiClient.put<Product>(`/api/inventory/products/${id}/`, product);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/inventory/products/${id}/`);
  },
};
