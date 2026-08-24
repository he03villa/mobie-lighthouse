import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  createOutline,
} from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { SubmissionService } from '../../../core/services/submission';
import { ActivitySubmission, SubmissionStatus } from '../../../core/models/submission';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.page.html',
  styleUrls: ['./activity-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
  IonItem,
  IonLabel,
  IonIcon,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ActivityDetailPage {
  private route = inject(ActivatedRoute);
  private submissionService = inject(SubmissionService);
  private nav = inject(NavigationService);

  loading = true;
  submission: ActivitySubmission | null = null;

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      timeOutline,
      closeCircleOutline,
      createOutline,
    });
  }

  ionViewWillEnter(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSubmission(id);
    }
  }

  async loadSubmission(id: string): Promise<void> {
    this.loading = true;
    try {
      this.submission = await this.submissionService.getAsync(id);
    } catch {
      this.submission = null;
    } finally {
      this.loading = false;
    }
  }

  getStatusIcon(status: SubmissionStatus): string {
    switch (status) {
      case 'approved':
        return 'checkmark-circle-outline';
      case 'submitted':
        return 'time-outline';
      case 'rejected':
        return 'close-circle-outline';
      default:
        return 'time-outline';
    }
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

  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  navigateToEvidence(): void {
    if (this.submission) {
      this.nav.forward(`/activities/${this.submission.activity.id}/evidence`, {
        activity: {
          name: this.submission.activity.name,
          description: this.submission.activity.description,
          type: this.submission.activity.type,
        },
        moduleName: this.submission.enrollment.program?.name ?? '',
        enrollmentId: this.submission.enrollment.id,
      });
    }
  }

  navigateToEdit(): void {
    if (this.submission) {
      this.nav.forward(`/activities/${this.submission.activity.id}/evidence`, {
        activity: {
          name: this.submission.activity.name,
          description: this.submission.activity.description,
          type: this.submission.activity.type,
        },
        moduleName: this.submission.enrollment.program?.name ?? '',
        enrollmentId: this.submission.enrollment.id,
      });
    }
  }
}
