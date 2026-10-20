import type { OrderStatus, ShippingAddress } from "@/lib/types";

export type AdminOrderItem = {
  id: string;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  unit_price_paise: number;
  quantity: number;
  total_paise: number;
};
export type AdminOrder = {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  phone: string;
  shipping_address: ShippingAddress;
  total_paise: number;
  discount_paise: number;
  shipping_paise: number;
  status: OrderStatus;
  payment_method: string | null;
  razorpay_payment_id: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: AdminOrderItem[];
};

export type AdminLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: boolean;
  created_at: string;
};

export type AdminProductHealth = {
  id: string;
  name: string;
  stock: number;
  is_active: boolean;
};

export type AdminCoupon = {
  code: string;
  discount_percent: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  redemptions: number;
  customers: number;
  discount_paise: number;
  revenue_paise: number;
};

export type AdminCampaign = {
  id: string;
  subject: string;
  body: string;
  created_at: string;
  pending: number;
  sent: number;
  failed: number;
  skipped: number;
};
