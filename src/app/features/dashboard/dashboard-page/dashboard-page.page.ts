import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  documentTextOutline,
  peopleOutline,
  schoolOutline,
  arrowForwardOutline,
  trendingUpOutline,
  fingerPrintOutline,
  ribbonOutline,
  personOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { ActiveTenantService } from '../../../core/services/active-tenant';
import { ParticipantService } from '../../../core/services/participant';
import { ProgramService } from '../../../core/services/program';
import { SubmissionService } from '../../../core/services/submission';
import { EnrollmentService } from '../../../core/services/enrollment';
import { GamificationService } from '../../../core/services/gamification';
import { Participant } from '../../../core/models/participant';
import { ActivitySubmission } from '../../../core/models/submission';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { AiSummaryCardComponent } from '../../../shared/components/ai-summary-card/ai-summary-card.component';

interface RecentActivity {
  id: string;
  name: string;
  status: string;
  programName: string;
  submittedAt?: string | null;
}

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
    IonRefresher,
    IonRefresherContent,
    IonBadge,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    AiSummaryCardComponent,
  ],
})
export class DashboardPagePage implements OnInit {
  private authService = inject(AuthService);
  private activeTenantService = inject(ActiveTenantService);
  private participantService = inject(ParticipantService);
  private programService = inject(ProgramService);
  private submissionService = inject(SubmissionService);
  private enrollmentService = inject(EnrollmentService);
  private gamification = inject(GamificationService);
  protected navController = inject(NavController);

  loading = true;
  user = this.authService.getUser();
  tenant = this.activeTenantService.getActiveTenant();
  isCoach = false;
  isParticipantUser = false;
  isParentUser = false;

  participants: Participant[] = [];
  recentActivities: RecentActivity[] = [];
  dailyGoalMet = false;
  streakCount = 0;
  xpTotal = 0;
  level = 0;
  participantProgress = 0;

  stats = {
    participants: 0,
    programs: 0,
    submissions: 0,
    pending: 0,
  };

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      documentTextOutline,
      peopleOutline,
      schoolOutline,
      arrowForwardOutline,
      trendingUpOutline,
      fingerPrintOutline,
      ribbonOutline,
      personOutline,
      checkmarkCircleOutline,
      timeOutline,
      closeCircleOutline,
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
    this.isCoach = this.activeTenantService.isCoachOrAbove();
    this.isParticipantUser = this.activeTenantService.isParticipant();
    this.isParentUser = this.activeTenantService.isParent();

    this.gamification.init().then(() => {
      const s = this.gamification.getStreak();
      this.streakCount = s.current;
      this.xpTotal = this.gamification.getXP();
      this.level = this.gamification.currentLevel();
      this.dailyGoalMet = this.gamification.getDailyCount() >= 1;
    });

    this.loading = true;

    const promises: Promise<void>[] = [];

    promises.push(
      this.participantService.myParticipantsAsync().then(participants => {
        this.participants = participants;
        this.stats.participants = participants.length;
      }).catch(() => {}),
    );

    promises.push(
      this.programService.listAsync().then(programs => {
        this.stats.programs = programs.length;
      }).catch(() => {}),
    );

    promises.push(
      this.submissionService.listAsync().then(submissions => {
        this.stats.submissions = submissions.length;
        this.stats.pending = submissions.filter(s => s.status === 'submitted').length;

        if (this.isParticipantUser || this.isParentUser) {
          this.buildRecentActivities(submissions);
        }
      }).catch(() => {}),
    );

    if (this.isParticipantUser) {
      promises.push(this.loadParticipantProgress());
    }

    Promise.all(promises).finally(() => {
      this.loading = false;
    });
  }

  private async loadParticipantProgress(): Promise<void> {
    try {
      const enrollments = await this.enrollmentService.listAsync();
      let totalActivities = 0;
      let completedActivities = 0;

      for (const enrollment of enrollments) {
        if (enrollment.progress) {
          totalActivities += enrollment.progress.total_activities;
          completedActivities += enrollment.progress.completed_activities;
        }
      }

      this.participantProgress = totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 100)
        : 0;
    } catch {
      this.participantProgress = 0;
    }
  }

  private buildRecentActivities(submissions: ActivitySubmission[]): void {
    this.recentActivities = submissions
      .sort((a, b) => new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime())
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        name: s.activity.name,
        status: s.status,
        programName: s.enrollment.program?.name ?? '',
        submittedAt: s.submitted_at,
      }));
  }

  initials(p: Participant): string {
    return p.first_name?.charAt(0)?.toUpperCase() ?? '?';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'time-outline',
      submitted: 'time-outline',
      reviewed: 'time-outline',
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

  handleRefresh(event: Event): void {
    const refresher = event.target as HTMLIonRefresherElement;
    this.loadData();
    setTimeout(() => refresher.complete(), 500);
  }

  navigateTo(path: string): void {
    this.navController.navigateForward(path);
  }
}
