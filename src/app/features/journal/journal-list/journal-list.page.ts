import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  documentTextOutline,
  lockClosedOutline,
  peopleOutline,
  globeOutline,
  eyeOutline,
} from 'ionicons/icons';
import { JournalService } from '../../../core/services/journal';
import { JournalEntry, JournalVisibility } from '../../../core/models/journal';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.page.html',
  styleUrls: ['./journal-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class JournalListPage {
  loading = true;
  entries: JournalEntry[] = [];

  private journalService = inject(JournalService);
  private nav = inject(NavigationService);

  constructor() {
    addIcons({
      addOutline,
      documentTextOutline,
      lockClosedOutline,
      peopleOutline,
      globeOutline,
      eyeOutline,
    });
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadEntries();
  }

  async loadEntries(): Promise<void> {
    this.loading = true;
    try {
      this.entries = await this.journalService.listAsync();
    } finally {
      this.loading = false;
    }
  }

  navigateToDetail(id: string): void {
    this.nav.forward(`/journal/${id}`);
  }

  navigateToCreate(): void {
    this.nav.forward('/journal/new');
  }

  getVisibilityIcon(visibility: JournalVisibility): string {
    switch (visibility) {
      case 'private':
        return 'lock-closed-outline';
      case 'shared_family':
      case 'shared_participant':
        return 'people-outline';
      case 'public':
        return 'globe-outline';
      default:
        return 'eye-outline';
    }
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
