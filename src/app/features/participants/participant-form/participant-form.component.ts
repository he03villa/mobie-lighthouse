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
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ParticipantService } from '../../../core/services/participant';
import { Participant } from '../../../core/models/participant';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-participant-form',
  templateUrl: './participant-form.component.html',
  styleUrls: ['./participant-form.component.scss'],
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
    IonSpinner,
  ],
})
export class ParticipantFormComponent {
  private route = inject(ActivatedRoute) as ActivatedRoute;
  private participantService = inject(ParticipantService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  participantId: string | null = null;
  isEdit = false;
  firstName = '';
  lastName = '';
  birthDate = '';
  loading = false;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.participantId = id;
      this.isEdit = true;
      this.loadParticipant();
    }
  }

  async loadParticipant(): Promise<void> {
    if (!this.participantId) return;
    this.loading = true;
    try {
      const participant: Participant = await this.participantService.getAsync(this.participantId);
      this.firstName = participant.first_name;
      this.lastName = participant.last_name;
      this.birthDate = participant.birth_date ?? '';
    } catch {
      await this.toast.show('Error al cargar participante');
      this.nav.back();
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    if (!this.firstName.trim() || !this.lastName.trim()) {
      await this.toast.show('Nombre y apellido son requeridos', 'warning');
      return;
    }

    this.loading = true;
    try {
      const data = {
        first_name: this.firstName.trim(),
        last_name: this.lastName.trim(),
        birth_date: this.birthDate || null,
      };

      if (this.isEdit && this.participantId) {
        await this.participantService.updateAsync(this.participantId, data);
      } else {
        await this.participantService.createAsync(data);
      }

      await this.toast.show(
        this.isEdit ? 'Participante actualizado' : 'Participante creado',
        'success',
      );
      this.nav.back();
    } catch {
      await this.toast.show('Error al guardar participante');
    } finally {
      this.loading = false;
    }
  }
}
