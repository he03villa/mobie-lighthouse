import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  openOutline,
  receiptOutline,
} from 'ionicons/icons';
import { BillingService } from '../../../core/services/billing';
import { BillingCurrent, Invoice, InvoiceStatus } from '../../../core/models/billing';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-billing-page',
  templateUrl: './billing-page.page.html',
  styleUrls: ['./billing-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class BillingPagePage {
  private billingService = inject(BillingService);

  loading = true;
  billing: BillingCurrent | null = null;
  invoices: Invoice[] = [];

  constructor() {
    addIcons({
      walletOutline,
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      openOutline,
      receiptOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadBilling();
  }

  async loadBilling(): Promise<void> {
    this.loading = true;
    try {
      const [current, invoices] = await Promise.all([
        this.billingService.currentAsync(),
        this.billingService.invoicesAsync(),
      ]);
      this.billing = current;
      this.invoices = invoices;
    } catch {
      this.billing = null;
      this.invoices = [];
    } finally {
      this.loading = false;
    }
  }

  async openPortal(): Promise<void> {
    try {
      const { url } = await this.billingService.portalAsync();
      window.open(url, '_blank');
    } catch {
      // portal failed silently
    }
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case 'paid':
        return 'success';
      case 'open':
        return 'warning';
      case 'void':
      case 'uncollectible':
        return 'error';
      default:
        return 'neutral';
    }
  }

  getStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'open':
        return 'Pendiente';
      case 'void':
        return 'Anulado';
      case 'uncollectible':
        return 'Cobro fallido';
      default:
        return status;
    }
  }
}
