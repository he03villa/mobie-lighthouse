import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  personOutline,
  peopleOutline,
  checkmarkCircleOutline,
  personRemoveOutline,
} from 'ionicons/icons';
import { ParticipantService } from '../../../core/services/participant';
import { ActiveTenantService } from '../../../core/services/active-tenant';
import { Participant } from '../../../core/models/participant';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-participant-list',
  templateUrl: './participant-list.page.html',
  styleUrls: ['./participant-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ParticipantListPage {
  private participantService = inject(ParticipantService);
  private activeTenant = inject(ActiveTenantService);
  private nav = inject(NavigationService);

  loading = true;
  participants: Participant[] = [];
  searchTerm = '';
  filter: 'all' | 'with_groups' | 'no_groups' = 'all';
  isParent = false;

  constructor() {
    addIcons({
      addOutline,
      personOutline,
      peopleOutline,
      checkmarkCircleOutline,
      personRemoveOutline,
    });
  }

  get filtered(): Participant[] {
    let list = this.participants;

    if (this.filter === 'with_groups') {
      list = list.filter(p => p.groups && p.groups.length > 0);
    } else if (this.filter === 'no_groups') {
      list = list.filter(p => !p.groups || p.groups.length === 0);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(
        p =>
          p.full_name.toLowerCase().includes(term) ||
          p.first_name.toLowerCase().includes(term) ||
          p.last_name.toLowerCase().includes(term),
      );
    }

    return list;
  }

  get featured(): Participant | undefined {
    const f = this.filtered;
    return f.length > 0 ? f[0] : undefined;
  }

  get rest(): Participant[] {
    const f = this.filtered;
    return f.length > 1 ? f.slice(1) : [];
  }

  get hasResults(): boolean {
    return this.filtered.length > 0;
  }

  ionViewWillEnter(): void {
    this.isParent = this.activeTenant.isParent();
    this.loadParticipants();
  }

  async loadParticipants(): Promise<void> {
    this.loading = true;
    try {
      if (this.isParent) {
        this.participants = await this.participantService.myParticipantsAsync();
      } else {
        this.participants = await this.participantService.listAsync();
      }
    } catch {
      this.participants = [];
    } finally {
      this.loading = false;
    }
  }

  onSearch(value: string): void {
    this.searchTerm = value.toLowerCase();
  }

  onFilterChange(value: string): void {
    this.filter = value as 'all' | 'with_groups' | 'no_groups';
  }

  navigateToDetail(id: string): void {
    this.nav.forward(`/participants/${id}`);
  }

  navigateToCreate(): void {
    this.nav.forward('/participants/new');
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  initials(p: Participant): string {
    return p.first_name?.charAt(0)?.toUpperCase() ?? '?';
  }

  groupCount(p: Participant): number {
    return p.groups?.length ?? 0;
  }

  guardianCount(p: Participant): number {
    return p.guardians?.length ?? 0;
  }
}
