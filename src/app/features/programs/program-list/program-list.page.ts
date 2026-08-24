import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  schoolOutline,
  timeOutline,
  layersOutline,
  checkmarkCircleOutline,
  hourglassOutline,
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
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
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
  filter: 'all' | 'published' | 'draft' = 'all';

  constructor() {
    addIcons({
      addOutline,
      schoolOutline,
      timeOutline,
      layersOutline,
      checkmarkCircleOutline,
      hourglassOutline,
    });
  }

  get filtered(): Program[] {
    let list = this.programs;

    if (this.filter === 'published') {
      list = list.filter(p => p.is_published);
    } else if (this.filter === 'draft') {
      list = list.filter(p => !p.is_published);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)),
      );
    }

    return list;
  }

  get featured(): Program | undefined {
    const filtered = this.filtered;
    if (filtered.length === 0) return undefined;
    return filtered[0];
  }

  get rest(): Program[] {
    const filtered = this.filtered;
    if (filtered.length <= 1) return [];
    return filtered.slice(1);
  }

  get hasResults(): boolean {
    return this.filtered.length > 0;
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

  onSearch(value: string): void {
    this.searchTerm = value.toLowerCase();
  }

  onFilterChange(value: string): void {
    this.filter = value as 'all' | 'published' | 'draft';
  }

  navigateToDetail(id: string): void {
    this.nav.forward(`/programs/${id}`);
  }

  navigateToCreate(): void {
    this.nav.forward('/programs/new');
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  moduleCount(program: Program): number {
    return program.modules?.length ?? 0;
  }
}
