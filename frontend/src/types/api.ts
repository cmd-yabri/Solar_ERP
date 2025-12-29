// API Types matching Django SolarOps API schemas based on OpenAPI spec

// Enums
export type JobTypeEnum = 'STEEL' | 'ELECTRIC' | 'INSTALL';
export type StatusEnum = 'PENDING' | 'RECEIVED' | 'CANCELLED';
export type CategoryEnum = 'RENT' | 'SALARY' | 'MARKETING' | 'UTILITIES' | 'OTHER';
export type RoleEnum = 'USER' | 'ADMIN';

// Product (Inventory)
export interface Product {
  id: number;
  name: string;
  category: number | null;
  category_name: string;
  unit_cost: string;
  selling_price?: string;
  current_stock?: number;
  reorder_threshold?: number;
}

export interface ProductCreate {
  name: string;
  category?: number | null;
  unit_cost: string;
  selling_price?: string;
  current_stock?: number;
  reorder_threshold?: number;
}

// Purchase Order
export interface POItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_cost: string;
  total_cost: string;
}

export interface POItemCreate {
  product: number;
  quantity: number;
  unit_cost: string;
}

export interface POPayment {
  id: number;
  amount: string;
  date: string;
  purchase_order: number;
}

export interface POPaymentCreate {
  amount: string;
  date: string;
}

export interface PurchaseOrder {
  id: number;
  supplier: number;
  supplier_name: string;
  status: StatusEnum;
  items: POItem[];
  payments: POPayment[];
  total_cost: string;
  total_paid: string;
  payment_status: string;
  created_at: string;
}

export interface PurchaseOrderCreate {
  supplier: number;
  status?: StatusEnum;
  items: POItemCreate[];
}

// Sales Order
export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface OrderItemCreate {
  product: number;
  quantity: number;
  unit_price: string;
}

export interface FreelanceJob {
  id: number;
  job_type: JobTypeEnum;
  contractor_name: string;
  cost_to_company: string;
  charge_to_client: string;
  is_completed: boolean;
  profit_margin: string;
}

export interface FreelanceJobCreate {
  job_type: JobTypeEnum;
  contractor_name: string;
  cost_to_company: string;
  charge_to_client: string;
  is_completed?: boolean;
}

export interface SalesOrder {
  id: number;
  client_name: string;
  client_phone?: string;
  date: string;
  is_finalized: boolean;
  items: OrderItem[];
  freelance_jobs: FreelanceJob[];
  product_total: string;
  service_total: string;
  grand_total: string;
}

export interface SalesOrderCreate {
  client_name: string;
  client_phone?: string;
  items: OrderItemCreate[];
  freelance_jobs?: FreelanceJobCreate[];
}

// Dashboard & Charts (based on DailyFinancialRecord schema)
export interface DailyFinancialRecord {
  date: string;
  total_revenue: string;
  total_cogs: string;
  total_freelance_costs: string;
  total_operational_expenses: string;
  net_profit: string;
}

export interface DashboardData {
  total_revenue?: string;
  total_cogs?: string;
  total_freelance_costs?: string;
  total_operational_expenses?: string;
  net_profit?: string;
  pending_orders?: number;
  low_stock_count?: number;
}

export interface FinancialSummary {
  period: string;
  total_revenue: string;
  total_cogs: string;
  total_freelance_costs: string;
  total_operational_expenses: string;
  net_profit: string;
}

// Expenses
export interface Expense {
  id: number;
  description: string;
  category: CategoryEnum;
  amount: string;
  date: string;
  receipt_image?: string | null;
}

export interface ExpenseCreate {
  description: string;
  category: CategoryEnum;
  amount: string;
  date: string;
  receipt_image?: string | null;
}

// Auth
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: RoleEnum;
  is_active: boolean;
}

export interface UserSignup {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role?: RoleEnum;
}
