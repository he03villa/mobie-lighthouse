import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, calendarOutline } from 'ionicons/icons';
import { PlanningTask } from '../../../core/models/planning';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton],
})
export class TaskCardComponent {
  @Input() task!: PlanningTask;
  @Output() edit = new EventEmitter<PlanningTask>();
  @Output() delete = new EventEmitter<string>();

  constructor() {
    addIcons({ createOutline, trashOutline, calendarOutline });
  }

  onEdit(): void {
    this.edit.emit(this.task);
  }

  onDelete(): void {
    this.delete.emit(this.task.id);
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  }
}
