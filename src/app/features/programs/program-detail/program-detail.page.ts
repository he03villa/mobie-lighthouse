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
  IonNote,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  schoolOutline,
  createOutline,
  trashOutline,
  checkmarkCircleOutline,
  timeOutline,
  listOutline,
} from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { ProgramService } from '../../../core/services/program';
import { Program } from '../../../core/models/program';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-program-detail',
  templateUrl: './program-detail.page.html',
  styleUrls: ['./program-detail.page.scss'],
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
    IonNote,
    IonIcon,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ProgramDetailPage {
  private route = inject(ActivatedRoute) as ActivatedRoute;
  private programService = inject(ProgramService);
  private nav = inject(NavigationService);
  private alertController = inject(AlertController);
  private toast = inject(ToastService);

  loading = true;
  program: Program | null = null;

  constructor() {
    addIcons({
      schoolOutline,
      createOutline,
      trashOutline,
      checkmarkCircleOutline,
      timeOutline,
      listOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadProgram();
  }

  async loadProgram(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading = true;
    try {
      this.program = await this.programService.getAsync(id);
    } catch {
      this.program = null;
    } finally {
      this.loading = false;
    }
  }

  editProgram(): void {
    if (this.program) {
      this.nav.forward(`/programs/${this.program.id}/edit`);
    }
  }

  async deleteProgram(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar programa',
      message: '¿Estás seguro de que quieres eliminar este programa? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (!this.program) return;
            try {
              await this.programService.deleteAsync(this.program.id);
              await this.toast.show('Programa eliminado', 'success');
              this.nav.back();
            } catch {
              await this.toast.show('Error al eliminar programa');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async togglePublish(): Promise<void> {
    if (!this.program) return;
    try {
      if (this.program.is_published) {
        this.program = await this.programService.unpublishAsync(this.program.id);
      } else {
        this.program = await this.programService.publishAsync(this.program.id);
      }
      await this.toast.show(
        this.program.is_published ? 'Programa publicado' : 'Programa despublicado',
        'success',
      );
    } catch {
      await this.toast.show('Error al cambiar estado del programa');
    }
  }
}
