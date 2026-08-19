import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  filterOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  eyeOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { SubmissionService, SubmissionFilters } from '../../../core/services/submission';
import { ActivitySubmission, SubmissionStatus } from '../../../core/models/submission';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.page.html',
  styleUrls: ['./activity-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ActivityListPage {
  private submissionService = inject(SubmissionService);
  private nav = inject(NavigationService);

  loading = true;
  submissions: ActivitySubmission[] = [];
  filteredSubmissions: ActivitySubmission[] = [];
  statusFilter = 'all';
  searchTerm = '';

  constructor() {
    addIcons({
      addOutline,
      filterOutline,
      checkmarkCircleOutline,
      timeOutline,
      closeCircleOutline,
      eyeOutline,
      chevronForwardOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadSubmissions();
  }

  async loadSubmissions(): Promise<void> {
    this.loading = true;
    try {
      const filters: SubmissionFilters = {};
      if (this.statusFilter !== 'all') {
        filters.status = this.statusFilter;
      }
      this.submissions = await this.submissionService.listAsync(filters);
      this.applySearch();
    } catch {
      this.submissions = [];
      this.filteredSubmissions = [];
    } finally {
      this.loading = false;
    }
  }

  onRefresh(event: CustomEvent): void {
    this.loadSubmissions().finally(() => {
      (event.target as HTMLIonRefresherElement).complete();
    });
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.loadSubmissions();
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applySearch();
  }

  private applySearch(): void {
    if (!this.searchTerm) {
      this.filteredSubmissions = [...this.submissions];
    } else {
      this.filteredSubmissions = this.submissions.filter(
        s =>
          s.activity.name.toLowerCase().includes(this.searchTerm) ||
          s.enrollment.participant.full_name.toLowerCase().includes(this.searchTerm),
      );
    }
  }

  navigateToDetail(id: string): void {
    this.nav.forward(`/activities/${id}`);
  }

  getStatusColor(status: SubmissionStatus): string {
    switch (status) {
      case 'approved':
        return 'success';
      case 'submitted':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'reviewed':
        return 'primary';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: SubmissionStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'submitted':
        return 'Enviado';
      case 'reviewed':
        return 'Revisado';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  }
}
