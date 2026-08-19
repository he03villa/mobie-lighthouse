import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { ApiResponse } from '../models/api-response';
import {
  BillingCurrent,
  CheckoutSession,
  Invoice,
  Plan,
  SubscriptionInfo,
} from '../models/billing';
import { environment } from '../../../environments/environment';

const BASE = environment.api.billing.name;
const SUBSCRIPTIONS = environment.api.billing.services.subscriptions;

@Injectable({ providedIn: 'root' })
export class BillingService {
  private api = inject(ApiService);

  plansAsync(): Promise<Plan[]> {
    return firstValueFrom(this.api.get<ApiResponse<Plan[]>>(`/${BASE}/${environment.api.billing.services.plans}`))
      .then(res => res.data);
  }

  currentAsync(): Promise<BillingCurrent> {
    return firstValueFrom(this.api.get<ApiResponse<BillingCurrent>>(`/${BASE}/${environment.api.billing.services.current}`))
      .then(res => res.data);
  }

  createSubscriptionAsync(planSlug: string, successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
    return firstValueFrom(
      this.api.post<ApiResponse<CheckoutSession>>(`/${BASE}/${SUBSCRIPTIONS}`, {
        plan_slug: planSlug,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    ).then(res => res.data);
  }

  swapAsync(planSlug: string): Promise<SubscriptionInfo> {
    return firstValueFrom(
      this.api.post<ApiResponse<SubscriptionInfo>>(`/${BASE}/${SUBSCRIPTIONS}/${environment.api.billing.services.swap}`, {
        plan_slug: planSlug,
      }),
    ).then(res => res.data);
  }

  cancelAsync(): Promise<SubscriptionInfo> {
    return firstValueFrom(this.api.post<ApiResponse<SubscriptionInfo>>(`/${BASE}/${SUBSCRIPTIONS}/${environment.api.billing.services.cancel}`))
      .then(res => res.data);
  }

  portalAsync(): Promise<{ url: string }> {
    return firstValueFrom(
      this.api.get<ApiResponse<{ url: string }>>(`/${BASE}/${SUBSCRIPTIONS}/${environment.api.billing.services.portal}`),
    ).then(res => res.data);
  }

  invoicesAsync(): Promise<Invoice[]> {
    return firstValueFrom(this.api.get<ApiResponse<Invoice[]>>(`/${BASE}/${environment.api.billing.services.invoices}`))
      .then(res => res.data);
  }
}
