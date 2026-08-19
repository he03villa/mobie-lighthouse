import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  personOutline,
  peopleOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { ParticipantService } from '../../../core/services/participant';
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
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonSearchbar,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ParticipantListPage {
  private participantService = inject(ParticipantService);
  private nav = inject(NavigationService);

  loading = true;
  participants: Participant[] = [];
  filtered: Participant[] = [];
  searchTerm = '';

  constructor() {
    addIcons({
      addOutline,
      personOutline,
      peopleOutline,
      chevronForwardOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadParticipants();
  }

  async loadParticipants(): Promise<void> {
    this.loading = true;
    try {
      this.participants = await this.participantService.listAsync();
      this.applySearch();
    } catch {
      this.participants = [];
      this.filtered = [];
    } finally {
      this.loading = false;
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applySearch();
  }

  private applySearch(): void {
    if (!this.searchTerm) {
      this.filtered = [...this.participants];
    } else {
      this.filtered = this.participants.filter(
        p =>
          p.full_name.toLowerCase().includes(this.searchTerm) ||
          p.first_name.toLowerCase().includes(this.searchTerm) ||
          p.last_name.toLowerCase().includes(this.searchTerm),
      );
    }
  }

  navigateToDetail(id: string): void {
    this.nav.forward(`/participants/${id}`);
  }

  navigateToCreate(): void {
    this.nav.forward('/participants/new');
  }
}
