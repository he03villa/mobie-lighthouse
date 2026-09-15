import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  createOutline,
  trashOutline,
  lockClosedOutline,
  peopleOutline,
  eyeOutline,
} from 'ionicons/icons';
import { FieldNoteService } from '../../../core/services/field-note';
import { FieldNote, FIELD_NOTE_VISIBILITY_LABELS, FieldNoteVisibility } from '../../../core/models/field-note';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-field-note-detail',
  templateUrl: './field-note-detail.page.html',
  styleUrls: ['./field-note-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonBadge,
    LoadingSpinnerComponent,
  ],
})
export class FieldNoteDetailPage {
  loading = true;
  note: FieldNote | null = null;

  private route = inject(ActivatedRoute);
  private fieldNoteService = inject(FieldNoteService);
  private nav = inject(NavigationService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastService);

  constructor() {
    addIcons({
      createOutline,
      trashOutline,
      lockClosedOutline,
      peopleOutline,
      eyeOutline,
    });
  }

  async ionViewWillEnter(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadNote(id);
    }
  }

  async loadNote(id: string): Promise<void> {
    this.loading = true;
    try {
      this.note = await this.fieldNoteService.getAsync(id);
    } finally {
      this.loading = false;
    }
  }

  editNote(): void {
    if (this.note) {
      this.nav.forward(`/field-notes/${this.note.id}/edit`);
    }
  }

  async deleteNote(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar nota',
      message: 'Estas seguro de que deseas eliminar esta nota de campo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (this.note) {
              await this.fieldNoteService.deleteAsync(this.note.id);
              await this.toast.show('Nota eliminada', 'success');
              this.nav.forward('/field-notes');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  getVisibilityLabel(): string {
    if (!this.note) return '';
    return FIELD_NOTE_VISIBILITY_LABELS[this.note.visibility] || this.note.visibility;
  }

  getVisibilityIcon(): string {
    if (!this.note) return 'eye-outline';
    switch (this.note.visibility) {
      case 'private':
        return 'lock-closed-outline';
      case 'shared_family':
      case 'shared_participant':
        return 'people-outline';
      case 'public':
        return 'eye-outline';
      default:
        return 'eye-outline';
    }
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
