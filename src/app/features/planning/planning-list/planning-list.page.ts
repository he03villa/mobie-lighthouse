import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonFab,
  IonFabButton,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  layersOutline,
  chevronForwardOutline,
  trashOutline,
  reorderThreeOutline,
} from 'ionicons/icons';
import { PlanningService } from '../../../core/services/planning';
import { PlanningBoard } from '../../../core/models/planning';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';
import { ActiveTenantService } from '../../../core/services/active-tenant';

@Component({
  selector: 'app-planning-list',
  templateUrl: './planning-list.page.html',
  styleUrls: ['./planning-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonFab,
    IonFabButton,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class PlanningListPage {
  loading = true;
  boards: PlanningBoard[] = [];
  isCoach = false;

  private planningService = inject(PlanningService);
  private nav = inject(NavigationService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastService);
  private activeTenant = inject(ActiveTenantService);

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      layersOutline,
      chevronForwardOutline,
      trashOutline,
      reorderThreeOutline,
    });
  }

  async ionViewWillEnter(): Promise<void> {
    this.isCoach = this.activeTenant.isCoachOrAbove();
    await this.loadBoards();
  }

  async loadBoards(): Promise<void> {
    this.loading = true;
    try {
      this.boards = await this.planningService.listBoardsAsync();
    } finally {
      this.loading = false;
    }
  }

  navigateToBoard(id: string): void {
    this.nav.forward(`/planning/${id}`);
  }

  async createBoard(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo tablero',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del tablero',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: async (data) => {
            if (data.name?.trim()) {
              const board = await this.planningService.createBoardAsync({ name: data.name.trim() });
              await this.toast.show('Tablero creado', 'success');
              this.navigateToBoard(board.id);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    if (diffDays < 7) return `Hace ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
