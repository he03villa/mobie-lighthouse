import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonButton,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  trashOutline,
  chevronDownOutline,
  chevronForwardOutline,
  imageOutline,
} from 'ionicons/icons';
import { ProgramService } from '../../../core/services/program';
import { ActivityType, ModuleRequest, ActivityRequest } from '../../../core/models/program';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

interface FormModule {
  name: string;
  description: string;
  order: number;
  expanded: boolean;
  activities: FormActivity[];
}

interface FormActivity {
  name: string;
  description: string;
  type: ActivityType;
  order: number;
}

@Component({
  selector: 'app-program-form',
  templateUrl: './program-form.component.html',
  styleUrls: ['./program-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonButton,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonCard,
    IonCardContent,
    IonChip,
  ],
})
export class ProgramFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private programService = inject(ProgramService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  editId: string | null = null;
  loading = false;
  saving = false;

  name = '';
  description = '';
  ageGroup = '';
  durationWeeks: number | null = null;
  isPublished = false;
  thumbnailUrl = '';

  modules: FormModule[] = [];

  activityTypes: { value: ActivityType; label: string }[] = [
    { value: 'upload', label: 'Upload' },
    { value: 'reflection', label: 'Reflexion' },
    { value: 'completion', label: 'Completacion' },
    { value: 'quiz', label: 'Quiz' },
  ];

  constructor() {
    addIcons({
      addOutline,
      trashOutline,
      chevronDownOutline,
      chevronForwardOutline,
      imageOutline,
    });
  }

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.loadProgram();
    }
  }

  get isEdit(): boolean {
    return !!this.editId;
  }

  async loadProgram(): Promise<void> {
    if (!this.editId) return;
    this.loading = true;
    try {
      const program = await this.programService.getAsync(this.editId);
      this.name = program.name;
      this.description = program.description ?? '';
      this.ageGroup = program.age_group ?? '';
      this.durationWeeks = program.duration_weeks ?? null;
      this.isPublished = program.is_published;
      this.thumbnailUrl = program.thumbnail ?? '';
      if (program.modules) {
        this.modules = program.modules.map((m, i) => ({
          name: m.name,
          description: m.description ?? '',
          order: m.order ?? i,
          expanded: false,
          activities: (m.activities ?? []).map((a, j) => ({
            name: a.name,
            description: a.description ?? '',
            type: a.type ?? 'completion',
            order: a.order ?? j,
          })),
        }));
      }
    } catch {
      await this.toast.show('Error al cargar programa');
      this.nav.back();
    } finally {
      this.loading = false;
    }
  }

  addModule(): void {
    this.modules.push({
      name: '',
      description: '',
      order: this.modules.length,
      expanded: true,
      activities: [],
    });
  }

  removeModule(index: number): void {
    this.modules.splice(index, 1);
  }

  addActivity(moduleIndex: number): void {
    const mod = this.modules[moduleIndex];
    mod.activities.push({
      name: '',
      description: '',
      type: 'completion',
      order: mod.activities.length,
    });
  }

  removeActivity(moduleIndex: number, activityIndex: number): void {
    this.modules[moduleIndex].activities.splice(activityIndex, 1);
  }

  toggleModule(moduleIndex: number): void {
    this.modules[moduleIndex].expanded = !this.modules[moduleIndex].expanded;
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadThumbnail(file);
  }

  async uploadThumbnail(file: File): Promise<void> {
    try {
      this.thumbnailUrl = await this.programService.uploadThumbnailAsync(file);
    } catch {
      await this.toast.show('Error al subir thumbnail');
    }
  }

  async save(): Promise<void> {
    if (!this.name.trim() || this.saving) return;

    this.saving = true;

    const modules: ModuleRequest[] | undefined = this.modules.length
      ? this.modules.map(m => ({
          name: m.name.trim(),
          description: m.description.trim() || undefined,
          order: m.order,
          activities: m.activities.length
            ? m.activities.map(a => ({
                name: a.name.trim(),
                description: a.description.trim() || undefined,
                type: a.type,
                order: a.order,
              }))
            : undefined,
        }))
      : undefined;

    const data = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      age_group: this.ageGroup.trim() || undefined,
      duration_weeks: this.durationWeeks ?? undefined,
      is_published: this.isPublished,
      thumbnail: this.thumbnailUrl || undefined,
      modules,
    };

    try {
    if (this.editId && this.editId !== 'new') {
        await this.programService.updateAsync(this.editId, data);
      } else {
        await this.programService.createAsync(data);
      }

      await this.toast.show(
        this.editId ? 'Programa actualizado' : 'Programa creado',
        'success',
      );
      this.nav.back();
    } catch {
      await this.toast.show('Error al guardar programa');
    } finally {
      this.saving = false;
    }
  }
}
