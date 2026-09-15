import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonNote,
  IonIcon,
  IonButton,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  lockClosedOutline,
  peopleOutline,
  eyeOutline,
} from 'ionicons/icons';
import { FieldNoteService } from '../../../core/services/field-note';
import { FieldNote, FieldNoteVisibility } from '../../../core/models/field-note';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';
import { AlertController } from '@ionic/angular/standalone';
import { ToastService } from '../../../core/services/toast';

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
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonNote,
    IonIcon,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class FieldNoteListPage {
  private fieldNoteService = inject(FieldNoteService);
  private nav = inject(NavigationService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastService);

  loading = true;
  notes: FieldNote[] = [];

  constructor() {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
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

  async handleRefresh(event: CustomEvent): Promise<void> {
    await this.loadNotes();
    (event.target as HTMLIonRefresherElement).complete();
  }

  openNote(note: FieldNote): void {
    this.nav.forward(`/field-notes/${note.id}`);
  }

  editNote(note: FieldNote, slidingItem: IonItemSliding): void {
    slidingItem.close();
    this.nav.forward(`/field-notes/${note.id}/edit`);
  }

  async deleteNote(note: FieldNote, slidingItem: IonItemSliding): Promise<void> {
    slidingItem.close();
    const alert = await this.alertCtrl.create({
      header: 'Eliminar nota',
      message: 'Estas seguro de que deseas eliminar esta nota de campo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.fieldNoteService.deleteAsync(note.id);
            await this.toast.show('Nota eliminada', 'success');
            this.notes = this.notes.filter(n => n.id !== note.id);
          },
        },
      ],
    });
    await alert.present();
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
