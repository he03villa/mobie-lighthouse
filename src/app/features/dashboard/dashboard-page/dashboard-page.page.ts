import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonButton,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  documentTextOutline,
  peopleOutline,
  schoolOutline,
  walletOutline,
  arrowForwardOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { ActiveTenantService } from '../../../core/services/active-tenant';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.page.html',
  styleUrls: ['./dashboard-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonButton,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class DashboardPagePage implements OnInit {
  private authService = inject(AuthService);
  private activeTenantService = inject(ActiveTenantService);
  protected navController = inject(NavController);

  loading = true;
  user = this.authService.getUser();
  tenant = this.activeTenantService.getActiveTenant();

  stats = {
    participants: 0,
    programs: 0,
    submissions: 0,
    pending: 0,
  };

  recentActivity: any[] = [];

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      documentTextOutline,
      peopleOutline,
      schoolOutline,
      walletOutline,
      arrowForwardOutline,
      trendingUpOutline,
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ionViewWillEnter(): void {
    this.loadData();
  }

  private loadData(): void {
    this.user = this.authService.getUser();
    this.tenant = this.activeTenantService.getActiveTenant();

    // MVP: use mock stats since there's no dashboard endpoint yet
    setTimeout(() => {
      this.stats = {
        participants: 24,
        programs: 6,
        submissions: 12,
        pending: 3,
      };
      this.recentActivity = [];
      this.loading = false;
    }, 500);
  }
}
