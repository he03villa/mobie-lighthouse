export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits?: Record<string, number | null>;
}

export type StripeSubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export interface SubscriptionInfo {
  status: StripeSubscriptionStatus;
  on_grace_period: boolean;
  ends_at?: string | null;
  price?: string | null;
}

export interface BillingUsage {
  participants: number;
  coaches: number;
}

export interface BillingCurrent {
  tenant: { id: string; name: string };
  plan: Plan;
  subscription: SubscriptionInfo | null;
  usage: BillingUsage;
}

export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

export interface Invoice {
  id: string;
  stripe_invoice_id?: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
}

export interface CheckoutSession {
  url: string;
  session_id: string;
}
