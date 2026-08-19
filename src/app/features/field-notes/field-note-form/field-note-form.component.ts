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
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { FieldNoteService } from '../../../core/services/field-note';
import { FieldNoteVisibility } from '../../../core/models/field-note';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

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
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class FieldNoteFormComponent {
  private route = inject(ActivatedRoute) as ActivatedRoute;
  private fieldNoteService = inject(FieldNoteService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  participantId = '';
  content = '';
  visibility: FieldNoteVisibility = 'private';
  sessionDate = '';
  loading = false;

  constructor() {
    this.participantId = this.route.snapshot.queryParamMap.get('participant_id') ?? '';
  }

  async save(): Promise<void> {
    if (!this.participantId.trim() || !this.content.trim()) {
      await this.toast.show('Participante y contenido son requeridos', 'warning');
      return;
    }

    this.loading = true;
    try {
      await this.fieldNoteService.createAsync({
        participant_id: this.participantId.trim(),
        content: this.content.trim(),
        visibility: this.visibility,
        session_date: this.sessionDate || null,
      });

      await this.toast.show('Nota creada', 'success');
      this.nav.back();
    } catch {
      await this.toast.show('Error al crear nota');
    } finally {
      this.loading = false;
    }
  }
}
