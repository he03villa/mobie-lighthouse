import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonBadge,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  eyeOutline,
  chevronForwardOutline,
  createOutline,
  documentTextOutline,
  helpCircleOutline,
  schoolOutline,
  musicalNotesOutline,
} from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment';
import { SubmissionService } from '../../../core/services/submission';
import { ProgramService } from '../../../core/services/program';
import { Enrollment } from '../../../core/models/enrollment';
import { ActivitySubmission } from '../../../core/models/submission';
import { Program, Module, Activity } from '../../../core/models/program';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

interface ActivityItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  submissionId?: string;
  activityId: string;
  moduleName?: string;
  enrollmentId?: string;
}

interface ModuleGroup {
  name: string;
  activities: ActivityItem[];
  completedCount: number;
  totalCount: number;
}

@Component({
  selector: 'app-enrollment-activities',
  templateUrl: './enrollment-activities.page.html',
  styleUrls: ['./enrollment-activities.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonIcon,
    IonBadge,
    IonProgressBar,
    IonRefresher,
    IonRefresherContent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class EnrollmentActivitiesPage {
  private route = inject(ActivatedRoute);
  private enrollmentService = inject(EnrollmentService);
  private submissionService = inject(SubmissionService);
  private programService = inject(ProgramService);
  private nav = inject(NavigationService);

  loading = true;
  enrollment: Enrollment | null = null;
  program: Program | null = null;
  moduleGroups: ModuleGroup[] = [];
  participantId = '';

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      timeOutline,
      closeCircleOutline,
      eyeOutline,
      chevronForwardOutline,
      createOutline,
      documentTextOutline,
      helpCircleOutline,
      schoolOutline,
      musicalNotesOutline,
    });
  }

  ionViewWillEnter(): void {
    this.participantId = this.route.snapshot.paramMap.get('id') ?? '';
    const enrollmentId = this.route.snapshot.paramMap.get('enrollmentId');
    if (enrollmentId) {
      this.loadData(enrollmentId);
    }
  }

  private async loadData(enrollmentId: string): Promise<void> {
    this.loading = true;
    try {
      this.enrollment = await this.enrollmentService.getAsync(enrollmentId);
      if (this.enrollment.program?.id) {
        this.program = await this.programService.getAsync(this.enrollment.program.id);
      }
      const submissions = await this.submissionService.listAsync({ enrollmentId });
      this.buildModuleGroups(submissions);
    } catch {
      this.enrollment = null;
      this.program = null;
      this.moduleGroups = [];
    } finally {
      this.loading = false;
    }
  }

  private buildModuleGroups(submissions: ActivitySubmission[]): void {
    if (!this.program?.modules) return;

    const submissionMap = new Map<string, ActivitySubmission>();
    for (const sub of submissions) {
      submissionMap.set(sub.activity.id, sub);
    }

    this.moduleGroups = this.program.modules.map((mod: Module) => {
      const activities: ActivityItem[] = (mod.activities ?? []).map((act: Activity) => {
        const submission = submissionMap.get(act.id);
        return {
          id: submission?.id ?? '',
          name: act.name,
          description: act.description ?? undefined,
          type: act.type,
          status: submission?.status ?? 'pending',
          submissionId: submission?.id,
          activityId: act.id,
          moduleName: mod.name,
          enrollmentId: this.enrollment?.id,
        };
      });

      const completedCount = activities.filter(
        a => a.status === 'approved' || a.status === 'submitted',
      ).length;

      return {
        name: mod.name,
        activities,
        completedCount,
        totalCount: activities.length,
      };
    });
  }

  navigateToActivity(item: ActivityItem): void {
    if (item.submissionId) {
      this.nav.forward(`/activities/${item.submissionId}`);
    } else {
      this.nav.forward(`/activities/${item.activityId}/evidence`, {
        activity: {
          name: item.name,
          description: item.description,
          type: item.type,
        },
        moduleName: item.moduleName ?? '',
        enrollmentId: item.enrollmentId ?? '',
      });
    }
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'time-outline',
      submitted: 'eye-outline',
      reviewed: 'eye-outline',
      approved: 'checkmark-circle-outline',
      rejected: 'close-circle-outline',
    };
    return icons[status] ?? 'time-outline';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'medium',
      submitted: 'warning',
      reviewed: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return colors[status] ?? 'medium';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      submitted: 'Enviado',
      reviewed: 'Revisado',
      approved: 'Aprobado',
      rejected: 'Rechazado',
    };
    return labels[status] ?? status;
  }

  getActivityTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      upload: 'document-text-outline',
      reflection: 'create-outline',
      completion: 'checkmark-circle-outline',
      quiz: 'help-circle-outline',
    };
    return icons[type] ?? 'school-outline';
  }

  handleRefresh(event: Event): void {
    const refresher = event.target as HTMLIonRefresherElement;
    const enrollmentId = this.route.snapshot.paramMap.get('enrollmentId');
    if (enrollmentId) {
      this.loadData(enrollmentId);
    }
    setTimeout(() => refresher.complete(), 500);
  }
}
