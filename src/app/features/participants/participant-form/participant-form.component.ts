import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonButton,
  IonInput,
  IonCheckbox,
  IonSpinner,
  IonIcon,
  IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, closeOutline } from 'ionicons/icons';
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
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonButton,
    IonInput,
    IonCheckbox,
    IonSpinner,
    IonIcon,
    IonFooter,
  ],
})
export class ParticipantFormComponent {
  private route = inject(ActivatedRoute) as ActivatedRoute;
  private fb = inject(FormBuilder);
  private participantService = inject(ParticipantService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  participantId: string | null = null;
  isEdit = false;
  loading = false;

  form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    birth_date: [''],
    guardians: this.fb.array([]),
  });

  get guardians(): FormArray {
    return this.form.controls.guardians;
  }

  constructor() {
    addIcons({ personAddOutline, closeOutline });
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
      this.form.patchValue({
        first_name: participant.first_name,
        last_name: participant.last_name,
        birth_date: participant.birth_date ?? '',
      });
    } catch {
      await this.toast.show('Error al cargar participante');
      this.nav.back();
    } finally {
      this.loading = false;
    }
  }

  addGuardian(): void {
    this.guardians.push(
      this.fb.nonNullable.group({
        name: [''],
        email: ['', [Validators.required, Validators.email]],
        relationship: [''],
        is_primary: [false],
      }),
    );
  }

  removeGuardian(index: number): void {
    this.guardians.removeAt(index);
  }

  guardianAt(index: number): FormGroup {
    return this.guardians.at(index) as FormGroup;
  }

  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;
    try {
      const { first_name, last_name, birth_date } = this.form.value;
      const data = {
        first_name: first_name!.trim(),
        last_name: last_name!.trim(),
        birth_date: birth_date || null,
        ...(this.isEdit ? {} : { guardians: this.guardians.value }),
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
