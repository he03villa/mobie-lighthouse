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
  globeOutline,
} from 'ionicons/icons';
import { JournalService } from '../../../core/services/journal';
import { JournalEntry, JOURNAL_VISIBILITY_LABELS, JournalVisibility } from '../../../core/models/journal';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-journal-detail',
  templateUrl: './journal-detail.page.html',
  styleUrls: ['./journal-detail.page.scss'],
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
export class JournalDetailPage {
  loading = true;
  entry: JournalEntry | null = null;

  private route = inject(ActivatedRoute);
  private journalService = inject(JournalService);
  private nav = inject(NavigationService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastService);

  constructor() {
    addIcons({
      createOutline,
      trashOutline,
      lockClosedOutline,
      peopleOutline,
      globeOutline,
    });
  }

  async ionViewWillEnter(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadEntry(id);
    }
  }

  async loadEntry(id: string): Promise<void> {
    this.loading = true;
    try {
      this.entry = await this.journalService.getAsync(id);
    } finally {
      this.loading = false;
    }
  }

  editEntry(): void {
    if (this.entry) {
      this.nav.forward(`/journal/edit/${this.entry.id}`);
    }
  }

  async deleteEntry(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar entrada',
      message: 'Estas seguro de que deseas eliminar esta entrada del diario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (this.entry) {
              await this.journalService.deleteAsync(this.entry.id);
              await this.toast.show('Entrada eliminada', 'success');
              this.nav.forward('/journal');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  getVisibilityLabel(): string {
    if (!this.entry) return '';
    return JOURNAL_VISIBILITY_LABELS[this.entry.visibility] || this.entry.visibility;
  }

  getVisibilityIcon(): string {
    if (!this.entry) return 'eye-outline';
    switch (this.entry.visibility) {
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
      month: 'long',
      year: 'numeric',
    });
  }
}
