import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'accept-invitation',
    loadComponent: () => import('./features/auth/accept-invitation/accept-invitation.page').then(m => m.AcceptInvitationPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout.page').then(m => m.LayoutPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page.page').then(m => m.DashboardPagePage),
      },
      {
        path: 'activities',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/activities/activity-list/activity-list.page').then(m => m.ActivityListPage),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/activities/activity-detail/activity-detail.page').then(m => m.ActivityDetailPage),
          },
          {
            path: ':activityId/evidence',
            loadComponent: () => import('./features/activities/evidence-submit/evidence-submit.component').then(m => m.EvidenceSubmitComponent),
          },
        ],
      },
      {
        path: 'journal',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/journal/journal-list/journal-list.page').then(m => m.JournalListPage),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/journal/journal-form/journal-form.component').then(m => m.JournalFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/journal/journal-form/journal-form.component').then(m => m.JournalFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/journal/journal-detail/journal-detail.page').then(m => m.JournalDetailPage),
          },
        ],
      },
      {
        path: 'planning',
        canActivate: [roleGuard('owner', 'admin', 'coach')],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/planning/planning-list/planning-list.page').then(m => m.PlanningListPage),
          },
          {
            path: 'task/new/:columnId',
            loadComponent: () => import('./features/planning/task-form/task-form.component').then(m => m.TaskFormComponent),
          },
          {
            path: 'task/edit/:taskId',
            loadComponent: () => import('./features/planning/task-form/task-form.component').then(m => m.TaskFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/planning/planning-board/planning-board.page').then(m => m.PlanningBoardPage),
          },
        ],
      },
      {
        path: 'billing',
        canActivate: [roleGuard('owner', 'admin')],
        loadComponent: () => import('./features/billing/billing-page/billing-page.page').then(m => m.BillingPagePage),
      },
      {
        path: 'participants',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/participants/participant-list/participant-list.page').then(m => m.ParticipantListPage),
          },
          {
            path: 'new',
            canActivate: [roleGuard('owner', 'admin', 'coach')],
            loadComponent: () => import('./features/participants/participant-form/participant-form.component').then(m => m.ParticipantFormComponent),
          },
          {
            path: ':id/enrollments/:enrollmentId/activities',
            loadComponent: () => import('./features/activities/enrollment-activities/enrollment-activities.page').then(m => m.EnrollmentActivitiesPage),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/participants/participant-detail/participant-detail.page').then(m => m.ParticipantDetailPage),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/participants/participant-form/participant-form.component').then(m => m.ParticipantFormComponent),
          },
        ],
      },
      {
        path: 'programs',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/programs/program-list/program-list.page').then(m => m.ProgramListPage),
          },
          {
            path: 'new',
            canActivate: [roleGuard('owner', 'admin', 'coach')],
            loadComponent: () => import('./features/programs/program-form/program-form.component').then(m => m.ProgramFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/programs/program-form/program-form.component').then(m => m.ProgramFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/programs/program-detail/program-detail.page').then(m => m.ProgramDetailPage),
          },
        ],
      },
      {
        path: 'field-notes',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/field-notes/field-note-list/field-note-list.page').then(m => m.FieldNoteListPage),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/field-notes/field-note-form/field-note-form.component').then(m => m.FieldNoteFormComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/field-notes/field-note-form/field-note-form.component').then(m => m.FieldNoteFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/field-notes/field-note-detail/field-note-detail.page').then(m => m.FieldNoteDetailPage),
          },
        ],
      },
      {
        path: 'messages',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/messaging/chat-list/chat-list.page').then(m => m.ChatListPage),
          },
          {
            path: ':conversationId',
            loadComponent: () => import('./features/messaging/chat-detail/chat-detail.page').then(m => m.ChatDetailPage),
          },
        ],
      },
      {
        path: 'community',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/community/forum-list/forum-list.page').then(m => m.ForumListPage),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/community/post-form/post-form.component').then(m => m.PostFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/community/post-detail/post-detail.page').then(m => m.PostDetailPage),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile-page/profile-page.page').then(m => m.ProfilePagePage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
