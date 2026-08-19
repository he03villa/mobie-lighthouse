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
  IonLabel,
  IonInput,
  IonTextarea,
  IonSpinner,
} from '@ionic/angular/standalone';
import { PlanningService } from '../../../core/services/planning';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
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
    IonLabel,
    IonInput,
    IonTextarea,
    IonSpinner,
  ],
})
export class TaskFormComponent implements OnInit {
  columnId = '';
  taskId: string | null = null;
  isEdit = false;
  title = '';
  description = '';
  startDate = '';
  dueDate = '';
  loading = false;

  private route = inject(ActivatedRoute);
  private planningService = inject(PlanningService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.columnId = this.route.snapshot.paramMap.get('columnId') || '';
    this.taskId = this.route.snapshot.paramMap.get('taskId') || null;

    if (this.taskId) {
      this.isEdit = true;
    }
  }

  async save(): Promise<void> {
    if (!this.title.trim()) return;

    this.loading = true;
    try {
      const data = {
        title: this.title.trim(),
        description: this.description.trim() || null,
        start_date: this.startDate || null,
        due_date: this.dueDate || null,
      };

      if (this.isEdit && this.taskId) {
        await this.planningService.updateTaskAsync(this.taskId, data);
      } else {
        await this.planningService.addTaskAsync(this.columnId, data);
      }

      await this.toast.show(
        this.isEdit ? 'Tarea actualizada' : 'Tarea creada',
        'success',
      );
      this.nav.forward('/planning');
    } finally {
      this.loading = false;
    }
  }
}
