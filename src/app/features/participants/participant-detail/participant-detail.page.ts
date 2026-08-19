import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  createOutline,
  trashOutline,
  addOutline,
  schoolOutline,
} from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { ParticipantService } from '../../../core/services/participant';
import { Participant } from '../../../core/models/participant';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-participant-detail',
  templateUrl: './participant-detail.page.html',
  styleUrls: ['./participant-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonBadge,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ParticipantDetailPage {
  private route = inject(ActivatedRoute) as ActivatedRoute;
  private participantService = inject(ParticipantService);
  private nav = inject(NavigationService);
  private alertController = inject(AlertController);
  private toast = inject(ToastService);

  loading = true;
  participant: Participant | null = null;

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      createOutline,
      trashOutline,
      addOutline,
      schoolOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadParticipant();
  }

  async loadParticipant(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    try {
      this.participant = await this.participantService.getAsync(id);
    } catch {
      this.participant = null;
    } finally {
      this.loading = false;
    }
  }

  editParticipant(): void {
    if (this.participant) {
      this.nav.forward(`/participants/${this.participant.id}/edit`);
    }
  }

  async deleteParticipant(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar participante',
      message: '¿Estás seguro de que quieres eliminar este participante? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (!this.participant) return;
            try {
              await this.participantService.deleteAsync(this.participant.id);
              await this.toast.show('Participante eliminado', 'success');
              this.nav.back();
            } catch {
              await this.toast.show('Error al eliminar participante');
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
