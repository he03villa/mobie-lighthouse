import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  layersOutline,
  chevronForwardOutline,
  trashOutline,
} from 'ionicons/icons';
import { PlanningService } from '../../../core/services/planning';
import { PlanningBoard } from '../../../core/models/planning';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

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
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class PlanningListPage {
  loading = true;
  boards: PlanningBoard[] = [];

  private planningService = inject(PlanningService);
  private nav = inject(NavigationService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastService);

  constructor() {
    addIcons({
      addOutline,
      calendarOutline,
      layersOutline,
      chevronForwardOutline,
      trashOutline,
    });
  }

  async ionViewWillEnter(): Promise<void> {
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
}
