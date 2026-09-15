import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  eyeOutline,
  chevronForwardOutline,
  musicalNotesOutline,
  createOutline,
  documentTextOutline,
  helpCircleOutline,
  schoolOutline,
  layersOutline,
} from 'ionicons/icons';
import { SubmissionService } from '../../../core/services/submission';
import { EnrollmentService } from '../../../core/services/enrollment';
import { ProgramService } from '../../../core/services/program';
import { ActiveTenantService } from '../../../core/services/active-tenant';
import { ParticipantService } from '../../../core/services/participant';
import { ActivitySubmission } from '../../../core/models/submission';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

export interface ActivityItem {
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

export interface ModuleGroup {
  name: string;
  activities: ActivityItem[];
  completedCount: number;
  totalCount: number;
}

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
  private enrollmentService = inject(EnrollmentService);
  private programService = inject(ProgramService);
  private activeTenant = inject(ActiveTenantService);
  private participantService = inject(ParticipantService);
  private nav = inject(NavigationService);

  loading = true;
  isParticipant = false;
  isParent = false;

  programName = '';
  programId = '';
  moduleGroups: ModuleGroup[] = [];
  filteredGroups: ModuleGroup[] = [];
  totalActivities = 0;
  completedActivities = 0;
  progressPercent = 0;

  statusFilter = 'all';
  searchTerm = '';

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      timeOutline,
      closeCircleOutline,
      eyeOutline,
      chevronForwardOutline,
      musicalNotesOutline,
      createOutline,
      documentTextOutline,
      helpCircleOutline,
      schoolOutline,
      layersOutline,
    });
  }

  ionViewWillEnter(): void {
    this.isParticipant = this.activeTenant.isParticipant();
    this.isParent = this.activeTenant.isParent();
    this.loadActivities();
  }

  async loadActivities(): Promise<void> {
    this.loading = true;
    try {
      if (this.isParticipant) {
        await this.loadParticipantActivities();
      } else if (this.isParent) {
        await this.loadParentActivities();
      } else {
        await this.loadCoachActivities();
      }
      this.applyFilter();
    } catch {
      this.moduleGroups = [];
      this.filteredGroups = [];
    } finally {
      this.loading = false;
    }
  }

  private async loadParticipantActivities(): Promise<void> {
    const enrollments = await this.enrollmentService.listAsync();
    const submissionsList = await this.submissionService.listAsync();

    for (const enrollment of enrollments) {
      if (!enrollment.program) continue;

      const program = await this.programService.getAsync(enrollment.program.id);
      this.programName = program.name;
      this.programId = program.id;

      const groups: ModuleGroup[] = [];
      let total = 0;
      let completed = 0;

      if (program.modules) {
        for (const mod of program.modules) {
          const activities: ActivityItem[] = [];
          let modCompleted = 0;

          if (mod.activities) {
            for (const act of mod.activities) {
              const submission = submissionsList.find(
                s => s.activity.id === act.id && s.enrollment.id === enrollment.id,
              );
              const status = submission ? submission.status : 'pending';
              if (status === 'approved' || status === 'reviewed') modCompleted++;

              activities.push({
                id: submission?.id ?? act.id,
                name: act.name,
                description: act.description ?? undefined,
                type: act.type,
                status,
                submissionId: submission?.id,
                activityId: act.id,
                moduleName: mod.name,
                enrollmentId: enrollment.id,
              });
            }
          }

          total += activities.length;
          completed += modCompleted;

          groups.push({
            name: mod.name,
            activities,
            completedCount: modCompleted,
            totalCount: activities.length,
          });
        }
      }

      this.moduleGroups = groups;
      this.totalActivities = total;
      this.completedActivities = completed;
      this.progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    }
  }

  private async loadParentActivities(): Promise<void> {
    const children = await this.participantService.myParticipantsAsync();
    const allEnrollments = [];
    for (const child of children) {
      const enrollments = await this.enrollmentService.listByParticipantAsync(child.id);
      allEnrollments.push(...enrollments);
    }
    const submissionsList = await this.submissionService.listAsync();

    let total = 0;
    let completed = 0;
    const allGroups: ModuleGroup[] = [];

    for (const enrollment of allEnrollments) {
      if (!enrollment.program) continue;

      const program = await this.programService.getAsync(enrollment.program.id);

      if (program.modules) {
        for (const mod of program.modules) {
          const activities: ActivityItem[] = [];
          let modCompleted = 0;

          if (mod.activities) {
            for (const act of mod.activities) {
              const submission = submissionsList.find(
                s => s.activity.id === act.id && s.enrollment.id === enrollment.id,
              );
              const status = submission ? submission.status : 'pending';
              if (status === 'approved' || status === 'reviewed') modCompleted++;

              activities.push({
                id: submission?.id ?? act.id,
                name: act.name,
                description: act.description ?? undefined,
                type: act.type,
                status,
                submissionId: submission?.id,
                activityId: act.id,
                moduleName: mod.name,
                enrollmentId: enrollment.id,
              });
            }
          }

          total += activities.length;
          completed += modCompleted;

          allGroups.push({
            name: `${program.name} - ${mod.name}`,
            activities,
            completedCount: modCompleted,
            totalCount: activities.length,
          });
        }
      }
    }

    this.moduleGroups = allGroups;
    this.totalActivities = total;
    this.completedActivities = completed;
    this.progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  private async loadCoachActivities(): Promise<void> {
    const submissions = await this.submissionService.listAsync(
      this.statusFilter !== 'all' ? { status: this.statusFilter } : {},
    );

    const activities: ActivityItem[] = submissions.map(s => ({
      id: s.id,
      name: s.activity.name,
      type: 'submission',
      status: s.status as ActivityItem['status'],
      submissionId: s.id,
      activityId: s.activity.id,
    }));

    this.moduleGroups = [{
      name: 'Todas las actividades',
      activities,
      completedCount: activities.filter(a => a.status === 'approved' || a.status === 'reviewed').length,
      totalCount: activities.length,
    }];
    this.totalActivities = activities.length;
    this.completedActivities = this.moduleGroups[0].completedCount;
    this.progressPercent = this.totalActivities > 0
      ? Math.round((this.completedActivities / this.totalActivities) * 100)
      : 0;
  }

  onRefresh(event: CustomEvent): void {
    this.loadActivities().finally(() => {
      (event.target as HTMLIonRefresherElement).complete();
    });
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.loadActivities();
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applyFilter();
  }

  private applyFilter(): void {
    const result: ModuleGroup[] = [];

    for (const group of this.moduleGroups) {
      let filtered = [...group.activities];

      if (this.isParticipant && this.statusFilter !== 'all') {
        filtered = filtered.filter(a => a.status === this.statusFilter);
      }

      if (this.searchTerm) {
        filtered = filtered.filter(a =>
          a.name.toLowerCase().includes(this.searchTerm),
        );
      }

      if (filtered.length > 0) {
        result.push({
          ...group,
          activities: filtered,
          completedCount: filtered.filter(a => a.status === 'approved' || a.status === 'reviewed').length,
          totalCount: filtered.length,
        });
      }
    }

    this.filteredGroups = result;
  }

  navigateToActivity(item: ActivityItem): void {
    if (this.isParticipant) {
      if (item.submissionId) {
        this.nav.forward(`/activities/${item.submissionId}`);
      } else {
        this.nav.forward(`/activities/${item.activityId}/evidence`, {
          activity: { name: item.name, description: item.description, type: item.type },
          moduleName: item.moduleName,
          enrollmentId: item.enrollmentId,
        });
      }
    } else if (item.submissionId) {
      this.nav.forward(`/activities/${item.submissionId}`);
    }
  }

  navigateToProgram(): void {
    if (this.programId) {
      this.nav.forward(`/programs/${this.programId}`);
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'upload': return 'create-outline';
      case 'reflection': return 'document-text-outline';
      case 'completion': return 'musical-notes-outline';
      case 'quiz': return 'help-circle-outline';
      default: return 'document-text-outline';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'upload': return 'icon-amber';
      case 'reflection': return 'icon-teal';
      case 'completion': return 'icon-blue';
      case 'quiz': return 'icon-purple';
      default: return 'icon-gray';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'reviewed': return 'primary';
      case 'submitted': return 'warning';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'submitted': return 'Enviado';
      case 'reviewed': return 'Revisado';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  }

  isClickable(item: ActivityItem): boolean {
    return this.isParticipant || !!item.submissionId;
  }
}
