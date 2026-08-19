import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  schoolOutline,
  checkmarkCircleOutline,
  timeOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { ProgramService } from '../../../core/services/program';
import { Program } from '../../../core/models/program';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.page.html',
  styleUrls: ['./program-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonSearchbar,
    IonChip,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ProgramListPage {
  private programService = inject(ProgramService);
  private nav = inject(NavigationService);

  loading = true;
  programs: Program[] = [];
  searchTerm = '';

  constructor() {
    addIcons({
      addOutline,
      schoolOutline,
      checkmarkCircleOutline,
      timeOutline,
      chevronForwardOutline,
    });
  }

  ionViewWillEnter(): void {
    this.loadPrograms();
  }

  async loadPrograms(): Promise<void> {
    this.loading = true;
    try {
      this.programs = await this.programService.listAsync();
    } catch {
      this.programs = [];
    } finally {
      this.loading = false;
    }
  }

  navigateToDetail(id: string): void {
    this.nav.forward(`/programs/${id}`);
  }

  navigateToCreate(): void {
    this.nav.forward('/programs/new');
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
