import { z } from "zod";

/** Regex-based rather than z.email()/z.string().email() so the schema behaves
 *  identically across zod 3 and 4. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const PHONE_IN = /^[6-9]\d{9}$/;
const PINCODE_IN = /^[1-9]\d{5}$/;

export const cartItemSchema = z.object({
  slug: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(10),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL, "Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
    .pipe(z.string().regex(PHONE_IN, "Enter a valid 10-digit mobile number")),
  address: z.object({
    line1: z.string().trim().min(4, "Enter your house / flat and street").max(200),
    line2: z.string().trim().max(200).optional().or(z.literal("")),
    city: z.string().trim().min(2, "Enter your city").max(80),
    state: z.string().trim().min(2, "Select your state").max(80),
    pincode: z.string().trim().regex(PINCODE_IN, "Enter a valid 6-digit PIN code"),
    country: z.string().trim().default("India"),
  }),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  couponCode: z.string().trim().max(32).optional().or(z.literal("")),
  items: z.array(cartItemSchema).min(1, "Your bag is empty").max(20),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const verifySchema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().regex(EMAIL, "Enter a valid email"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
});

export const couponLeadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().toLowerCase().regex(EMAIL, "Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
    .pipe(z.string().regex(PHONE_IN, "Enter a valid 10-digit mobile number")),
  consent: z.literal(true, { error: "Please agree before claiming the coupon" }),
});

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;
