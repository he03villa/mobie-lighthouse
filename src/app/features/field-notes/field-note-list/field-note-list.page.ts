import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  lockClosedOutline,
  peopleOutline,
  eyeOutline,
} from 'ionicons/icons';
import { FieldNoteService } from '../../../core/services/field-note';
import { FieldNote, FieldNoteVisibility } from '../../../core/models/field-note';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-field-note-list',
  templateUrl: './field-note-list.page.html',
  styleUrls: ['./field-note-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon,
    IonButton,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class FieldNoteListPage {
  private fieldNoteService = inject(FieldNoteService);
  private nav = inject(NavigationService);

  loading = true;
  notes: FieldNote[] = [];

  constructor() {
    addIcons({
      addOutline,
      createOutline,
      lockClosedOutline,
      peopleOutline,
      eyeOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadNotes();
  }

  async loadNotes(): Promise<void> {
    this.loading = true;
    try {
      this.notes = await this.fieldNoteService.listAsync();
    } catch {
      this.notes = [];
    } finally {
      this.loading = false;
    }
  }

  navigateToCreate(): void {
    this.nav.forward('/field-notes/new');
  }

  getVisibilityIcon(visibility: FieldNoteVisibility): string {
    switch (visibility) {
      case 'private':
        return 'lock-closed-outline';
      case 'shared_family':
      case 'shared_participant':
        return 'people-outline';
      case 'public':
        return 'eye-outline';
      default:
        return 'lock-closed-outline';
    }
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
