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
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonFab,
  IonFabButton,
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
import { ToastService } from '../../../core/services/toast';
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
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonFab,
    IonFabButton,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class JournalListPage {
  loading = true;
  entries: JournalEntry[] = [];
  filteredEntries: JournalEntry[] = [];
  searchTerm = '';

  private journalService = inject(JournalService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

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
      this.applyFilter();
    } catch {
      await this.toast.show('Error al cargar entradas', 'danger');
      this.entries = [];
      this.filteredEntries = [];
    } finally {
      this.loading = false;
    }
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEntries = this.entries;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredEntries = this.entries.filter(
        e => e.content?.toLowerCase().includes(term) ||
          e.participant?.full_name?.toLowerCase().includes(term)
      );
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchTerm = target.value ?? '';
    this.applyFilter();
  }

  handleRefresh(event: Event): void {
    const refresher = event.target as HTMLIonRefresherElement;
    this.loadEntries();
    setTimeout(() => refresher.complete(), 500);
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
