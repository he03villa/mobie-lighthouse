import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { JournalService } from '../../../core/services/journal';
import { JournalVisibility } from '../../../core/models/journal';
import { ParticipantService } from '../../../core/services/participant';
import { ActiveTenantService } from '../../../core/services/active-tenant';
import { Participant } from '../../../core/models/participant';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-journal-form',
  templateUrl: './journal-form.component.html',
  styleUrls: ['./journal-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class JournalFormComponent implements OnInit {
  entryId: string | null = null;
  isEdit = false;
  content = '';
  visibility: JournalVisibility = 'private';
  entryDate = '';
  participantId = '';
  loading = false;
  participants: Participant[] = [];
  isCoach = false;

  private route = inject(ActivatedRoute);
  private journalService = inject(JournalService);
  private participantService = inject(ParticipantService);
  private activeTenantService = inject(ActiveTenantService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  async ngOnInit(): Promise<void> {
    this.isCoach = this.activeTenantService.isCoachOrAbove();
    await this.loadParticipants();

    this.entryId = this.route.snapshot.paramMap.get('id');
    if (this.entryId) {
      this.isEdit = true;
      await this.loadEntry();
    } else {
      this.entryDate = new Date().toISOString().split('T')[0];
    }
  }

  async loadParticipants(): Promise<void> {
    try {
      if (this.isCoach) {
        this.participants = await this.participantService.listAsync();
      } else {
        this.participants = await this.participantService.myParticipantsAsync();
      }
    } catch {
      this.participants = [];
    }
  }

  async loadEntry(): Promise<void> {
    if (!this.entryId) return;
    this.loading = true;
    try {
      const entry = await this.journalService.getAsync(this.entryId);
      this.content = entry.content;
      this.visibility = entry.visibility;
      this.entryDate = entry.entry_date || '';
      this.participantId = entry.participant_id || '';
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    if (!this.content.trim()) return;

    this.loading = true;
    try {
      const data = {
        content: this.content.trim(),
        visibility: this.visibility,
        entry_date: this.entryDate || null,
        participant_id: this.participantId || null,
      };

      if (this.isEdit && this.entryId) {
        await this.journalService.updateAsync(this.entryId, data);
      } else {
        await this.journalService.createAsync(data);
      }

      await this.toast.show(
        this.isEdit ? 'Entrada actualizada' : 'Entrada creada',
        'success',
      );
      this.nav.forward('/journal');
    } finally {
      this.loading = false;
    }
  }
}
