import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { FieldNoteService } from '../../../core/services/field-note';
import { FieldNoteVisibility } from '../../../core/models/field-note';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-field-note-form',
  templateUrl: './field-note-form.component.html',
  styleUrls: ['./field-note-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonIcon,
    LoadingSpinnerComponent,
  ],
})
export class FieldNoteFormComponent {
  private route = inject(ActivatedRoute) as ActivatedRoute;
  private fieldNoteService = inject(FieldNoteService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);
  private alertCtrl = inject(AlertController);

  editMode = false;
  noteId = '';
  participantId = '';
  content = '';
  visibility: FieldNoteVisibility = 'private';
  sessionDate = '';
  loading = false;
  saving = false;

  constructor() {
    addIcons({ trashOutline });
    this.noteId = this.route.snapshot.paramMap.get('id') ?? '';
    this.editMode = !!this.noteId;
    this.participantId = this.route.snapshot.queryParamMap.get('participant_id') ?? '';
  }

  async ionViewWillEnter(): Promise<void> {
    if (this.editMode && this.noteId) {
      await this.loadNote();
    }
  }

  async loadNote(): Promise<void> {
    this.loading = true;
    try {
      const note = await this.fieldNoteService.getAsync(this.noteId);
      this.participantId = note.participant?.id ?? '';
      this.content = note.content;
      this.visibility = note.visibility;
      this.sessionDate = note.session_date ?? '';
    } catch {
      await this.toast.show('Error al cargar la nota');
      this.nav.back();
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    if (!this.content.trim()) {
      await this.toast.show('El contenido es requerido', 'warning');
      return;
    }

    if (!this.editMode && !this.participantId.trim()) {
      await this.toast.show('El participante es requerido', 'warning');
      return;
    }

    this.saving = true;
    try {
      if (this.editMode) {
        await this.fieldNoteService.updateAsync(this.noteId, {
          content: this.content.trim(),
          visibility: this.visibility,
          session_date: this.sessionDate || null,
        });
        await this.toast.show('Nota actualizada', 'success');
      } else {
        await this.fieldNoteService.createAsync({
          participant_id: this.participantId.trim(),
          content: this.content.trim(),
          visibility: this.visibility,
          session_date: this.sessionDate || null,
        });
        await this.toast.show('Nota creada', 'success');
      }
      this.nav.back();
    } catch {
      await this.toast.show(this.editMode ? 'Error al actualizar' : 'Error al crear');
    } finally {
      this.saving = false;
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
            await this.fieldNoteService.deleteAsync(this.noteId);
            await this.toast.show('Nota eliminada', 'success');
            this.nav.forward('/field-notes');
          },
        },
      ],
    });
    await alert.present();
  }
}
