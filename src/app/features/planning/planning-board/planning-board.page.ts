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
  IonIcon,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, reorderThreeOutline } from 'ionicons/icons';
import { PlanningService } from '../../../core/services/planning';
import { PlanningBoard, PlanningColumn } from '../../../core/models/planning';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TaskCardComponent } from '../task-card/task-card.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';
import { ActiveTenantService } from '../../../core/services/active-tenant';

@Component({
  selector: 'app-planning-board',
  templateUrl: './planning-board.page.html',
  styleUrls: ['./planning-board.page.scss'],
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
    IonIcon,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    TaskCardComponent,
  ],
})
export class PlanningBoardPage {
  loading = true;
  board: PlanningBoard | null = null;
  columns: PlanningColumn[] = [];
  isCoach = false;

  private route = inject(ActivatedRoute);
  private planningService = inject(PlanningService);
  private nav = inject(NavigationService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastService);
  private activeTenant = inject(ActiveTenantService);

  constructor() {
    addIcons({ addOutline, trashOutline, reorderThreeOutline });
  }

  async ionViewWillEnter(): Promise<void> {
    this.isCoach = this.activeTenant.isCoachOrAbove();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadBoard(id);
    }
  }

  async loadBoard(id: string): Promise<void> {
    this.loading = true;
    try {
      this.board = await this.planningService.getBoardAsync(id);
      this.columns = this.board?.columns ?? [];
    } finally {
      this.loading = false;
    }
  }

  async addColumn(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Nueva columna',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la columna',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: async (data) => {
            if (data.name?.trim() && this.board) {
              const column = await this.planningService.addColumnAsync(this.board.id, {
                name: data.name.trim(),
                position: this.columns.length,
              });
              this.columns = [...this.columns, column];
              await this.toast.show('Columna creada', 'success');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteColumn(columnId: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar columna',
      message: 'Se eliminaran todas las tareas de esta columna.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.planningService.deleteColumnAsync(columnId);
            this.columns = this.columns.filter(c => c.id !== columnId);
            await this.toast.show('Columna eliminada', 'success');
          },
        },
      ],
    });
    await alert.present();
  }

  addTask(columnId: string): void {
    this.nav.forward(`/planning/task/new/${columnId}`);
  }

  deleteTask(taskId: string): void {
    this.planningService.deleteTaskAsync(taskId).then(() => {
      if (this.board) {
        this.loadBoard(this.board.id);
      }
    });
  }
}
