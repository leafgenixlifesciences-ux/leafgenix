export type ProductFaq = { q: string; a: string };
export type Differentiator = { title: string; body: string };
export type SpecRow = { label: string; value: string };
export type NutritionRow = {
  nutrient: string;
  dose: string;
  unit: string;
  rda: string;
};
export type EvidenceItem = { claim: string; source: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  badge: string | null;
  category: string;
  form: string | null;
  flavour: string | null;
  pack_size: string | null;
  short_description: string | null;
  description: string | null;
  composition: string | null;
  key_benefits: string[];
  uses: string[];
  ingredients: string[];
  differentiators: Differentiator[];
  specifications: SpecRow[];
  nutrition: NutritionRow[];
  evidence: EvidenceItem[];
  directions: string | null;
  safety_info: string | null;
  faqs: ProductFaq[];
  price_paise: number;
  mrp_paise: number;
  gst_rate: number;
  hsn_code: string | null;
  stock: number;
  image_url: string | null;
  gallery: string[];
  rating: number | null;
  review_count: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type OrderStatus =
  | "created"
  | "pending"
  | "paid"
  | "failed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  full_name: string;
  shipping_address: ShippingAddress;
  subtotal_paise: number;
  shipping_paise: number;
  discount_paise: number;
  total_paise: number;
  status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_method: string | null;
  failure_reason: string | null;
  tracking_number: string | null;
  courier_name: string | null;
  created_at: string;
  customer_confirmation_email_sent_at: string | null;
  admin_notification_email_sent_at: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  unit_price_paise: number;
  quantity: number;
  total_paise: number;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

/** What the browser sends us. Prices are deliberately NOT included — the
 *  server always re-reads price from the database. */
export type CartLineInput = {
  slug: string;
  quantity: number;
};

/** A line in the bag, as held in localStorage.
 *
 *  Note there is no selling price here: the price a customer pays is always
 *  derived from `mrpPaise` through `couponPricePaise()`, on both the client and
 *  the server, so there is only ever one number to keep in step. */
export type CartLine = {
  slug: string;
  id: string;
  name: string;
  image: string | null;
  mrpPaise: number;
  packSize: string | null;
  quantity: number;
  stock: number;
};

export type RxProduct = {
  id: string;
  slug: string;
  name: string;
  composition: string;
  form: string | null;
  therapy_area: string;
  indications: string[];
  accent_hex: string | null;
  sort_order: number;
  /** Pack photographs, where the product has been shot. Most of the range has
   *  none yet, and a card without a photo simply renders as text. */
  image_url: string | null;
  gallery: string[];
  pack_size: string | null;
  /** Every one of these is prescription-only; kept explicit so the card can
   *  say so rather than relying on the page banner alone. */
  schedule: string | null;
};
