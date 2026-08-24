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
  arrowForwardOutline,
  trendingUpOutline,
  fingerPrintOutline,
  ribbonOutline,
  personOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth';
import { ActiveTenantService } from '../../../core/services/active-tenant';
import { ParticipantService } from '../../../core/services/participant';
import { ProgramService } from '../../../core/services/program';
import { SubmissionService } from '../../../core/services/submission';
import { GamificationService } from '../../../core/services/gamification';
import { Participant } from '../../../core/models/participant';
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
  private participantService = inject(ParticipantService);
  private programService = inject(ProgramService);
  private submissionService = inject(SubmissionService);
  private gamification = inject(GamificationService);
  protected navController = inject(NavController);

  loading = true;
  user = this.authService.getUser();
  tenant = this.activeTenantService.getActiveTenant();
  isCoach = false;
  isParticipantUser = false;
  isParentUser = false;

  participants: Participant[] = [];
  dailyGoalMet = false;
  streakCount = 0;
  xpTotal = 0;
  level = 0;

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
      }).catch(() => {}),
    );

    Promise.all(promises).finally(() => {
      this.loading = false;
    });
  }

  initials(p: Participant): string {
    return p.first_name?.charAt(0)?.toUpperCase() ?? '?';
  }

  navigateTo(path: string): void {
    this.navController.navigateForward(path);
  }
}
