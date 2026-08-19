import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonButton,
  IonTextarea,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, documentAttachOutline, sendOutline } from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { SubmissionService } from '../../../core/services/submission';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-evidence-submit',
  templateUrl: './evidence-submit.component.html',
  styleUrls: ['./evidence-submit.component.scss'],
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
    IonTextarea,
    IonIcon,
    IonSpinner,
  ],
})
export class EvidenceSubmitComponent {
  private route = inject(ActivatedRoute);
  private submissionService = inject(SubmissionService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  activityId = '';
  textContent = '';
  files: File[] = [];
  loading = false;

  constructor() {
    addIcons({ cameraOutline, documentAttachOutline, sendOutline });
    this.activityId = this.route.snapshot.paramMap.get('activityId') ?? '';
  }

  ionViewWillEnter(): void {
    this.activityId = this.route.snapshot.paramMap.get('activityId') ?? '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files = [...this.files, ...Array.from(input.files)];
      input.value = '';
    }
  }

  removeFile(index: number): void {
    this.files = this.files.filter((_, i) => i !== index);
  }

  async submit(): Promise<void> {
    if (!this.textContent.trim() && this.files.length === 0) {
      await this.toast.show('Agrega un texto o archivos como evidencia', 'warning');
      return;
    }

    this.loading = true;
    try {
      const formData = new FormData();
      if (this.textContent.trim()) {
        formData.set('content', this.textContent.trim());
      }
      this.files.forEach((file, i) => {
        formData.append(`files[${i}]`, file, file.name);
      });

      await this.submissionService.submitAsync(this.activityId, formData);

      await this.toast.show('Evidencia enviada correctamente', 'success');
      this.nav.back();
    } catch {
      await this.toast.show('Error al enviar la evidencia');
    } finally {
      this.loading = false;
    }
  }
}
