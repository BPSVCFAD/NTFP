// ── Order ──────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'packed'
  | 'delivered'
  | 'rejected';

export type PaymentStatus = 'paid' | 'unpaid' | 'pending_verification';

export interface StatusHistoryItem {
  status: string;
  timestamp: string;
  by: string;
}

export interface Order {
  id: string;
  date: string;
  buyer: string;
  gstin: string;
  sku: string;
  skuName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  utr: string | null;
  challanUploaded: boolean;
  deliveryDate: string | null;
  notes: string;
  rejectionReason?: string;
  statusHistory: StatusHistoryItem[];
}

// ── SKU ────────────────────────────────────────────────────────────────────
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface SKU {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
  sourceState: string;
  sourceDistrict?: string;
  batchSize: number;
  unit: string;
  price: number;
  moq: number;
  stockStatus: StockStatus;
  archived: boolean;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Category ───────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  skuCount: number;
}

// ── Enquiry ────────────────────────────────────────────────────────────────
export type EnquiryStatus = 'open' | 'in_progress' | 'resolved';
export type EnquiryCategory =
  | 'pricing'
  | 'product_info'
  | 'compliance'
  | 'logistics'
  | 'partnership';

export interface Enquiry {
  id: string;
  date: string;
  userName: string;
  businessName: string;
  gstin: string;
  email: string;
  phone: string;
  skuRef: string;
  skuName: string;
  message: string;
  status: EnquiryStatus;
  category: EnquiryCategory;
  adminNotes: string;
  createdAt: string;
  resolvedAt: string | null;
}

// ── User ───────────────────────────────────────────────────────────────────
export type UserStatus = 'active' | 'deactivated';

export interface AppUser {
  id: string;
  name: string;
  businessName: string;
  gstin: string;
  email: string;
  phone: string;
  role: string;
  registrationDate: string;
  lastActive: string;
  orderCount: number;
  totalSpend: number;
  status: UserStatus;
  city: string;
  state: string;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export interface AuthUser {
  name: string;
  email: string;
  role: string;
}
