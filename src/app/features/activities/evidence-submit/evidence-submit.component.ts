import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonTextarea,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  documentAttachOutline,
  sendOutline,
  imageOutline,
  videocamOutline,
  micOutline,
  documentTextOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  createOutline,
  helpCircleOutline,
  musicalNotesOutline,
  schoolOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { SubmissionService } from '../../../core/services/submission';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';
import { GamificationService } from '../../../core/services/gamification';
import { FeedbackService } from '../../../core/services/feedback';
import { CelebrationOverlayComponent } from '../../../shared/components/celebration-overlay/celebration-overlay.component';

interface ActivityContext {
  name: string;
  description?: string;
  type: string;
}

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
    IonTextarea,
    IonIcon,
    IonSpinner,
    CelebrationOverlayComponent,
  ],
})
export class EvidenceSubmitComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private submissionService = inject(SubmissionService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);
  private gamification = inject(GamificationService);
  protected feedback = inject(FeedbackService);

  activityId = '';
  activityData: ActivityContext | null = null;
  moduleName = '';
  enrollmentId = '';
  textContent = '';
  files: File[] = [];
  loading = false;
  dragOver = false;
  showCelebration = false;
  celebrationXP = 15;
  celebrationMsg = '¡Excelente!';

  constructor() {
    addIcons({
      cameraOutline,
      documentAttachOutline,
      sendOutline,
      imageOutline,
      videocamOutline,
      micOutline,
      documentTextOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      createOutline,
      helpCircleOutline,
      musicalNotesOutline,
      schoolOutline,
      cloudUploadOutline,
    });
  }

  ngOnInit(): void {
    this.activityId = this.route.snapshot.paramMap.get('activityId') ?? '';
    const state = this.router.getCurrentNavigation()?.extras?.state
      ?? history.state;
    this.activityData = state?.['activity'] ?? null;
    this.moduleName = state?.['moduleName'] ?? '';
    this.enrollmentId = state?.['enrollmentId'] ?? '';
  }

  ionViewWillEnter(): void {
    if (!this.activityId) {
      this.activityId = this.route.snapshot.paramMap.get('activityId') ?? '';
    }
  }

  get activityType(): string {
    return this.activityData?.type ?? 'upload';
  }

  get typeIcon(): string {
    switch (this.activityType) {
      case 'upload': return 'camera-outline';
      case 'reflection': return 'create-outline';
      case 'completion': return 'musical-notes-outline';
      case 'quiz': return 'help-circle-outline';
      default: return 'document-text-outline';
    }
  }

  get typeLabel(): string {
    switch (this.activityType) {
      case 'upload': return 'Subir evidencia';
      case 'reflection': return 'Reflexion';
      case 'completion': return 'Completar actividad';
      case 'quiz': return 'Responder';
      default: return 'Evidencia';
    }
  }

  get typeColorClass(): string {
    switch (this.activityType) {
      case 'upload': return 'type-amber';
      case 'reflection': return 'type-teal';
      case 'completion': return 'type-blue';
      case 'quiz': return 'type-purple';
      default: return 'type-gray';
    }
  }

  get typeGradient(): string {
    switch (this.activityType) {
      case 'upload': return 'linear-gradient(135deg,#d97706,#b45309)';
      case 'reflection': return 'linear-gradient(135deg,#0891b2,#0e7490)';
      case 'completion': return 'linear-gradient(135deg,#2563eb,#1d4d8f)';
      case 'quiz': return 'linear-gradient(135deg,#7c3aed,#6d28d9)';
      default: return 'linear-gradient(135deg,#667085,#475569)';
    }
  }

  get acceptTypes(): string {
    switch (this.activityType) {
      case 'upload': return 'image/*,video/*,.pdf,.doc,.docx';
      case 'reflection': return 'image/*,.pdf,.doc,.docx';
      default: return 'image/*,video/*,audio/*,.pdf,.doc,.docx';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files) {
      this.files = [...this.files, ...Array.from(event.dataTransfer.files)];
    }
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

  getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'image-outline';
    if (type.startsWith('video/')) return 'videocam-outline';
    if (type.startsWith('audio/')) return 'mic-outline';
    return 'document-text-outline';
  }

  private inferEvidenceType(): string {
    if (this.files.length === 0) return 'text';
    const mime = this.files[0].type;
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    return 'file';
  }

  async submit(): Promise<void> {
    if (!this.textContent.trim() && this.files.length === 0) {
      await this.toast.show('Agrega un texto o archivos como evidencia', 'warning');
      return;
    }

    this.loading = true;
    try {
      const formData = new FormData();
      formData.set('enrollment_id', this.enrollmentId);
      formData.set('evidence_type', this.inferEvidenceType());

      if (this.textContent.trim()) {
        formData.set('content', this.textContent.trim());
      }
      if (this.files.length > 0) {
        formData.set('evidence_file', this.files[0], this.files[0].name);
      }

      await this.submissionService.submitAsync(this.activityId, formData);

      const xpAmount = this.activityType === 'reflection' ? 20 : 15;
      this.celebrationXP = xpAmount;
      this.celebrationMsg = this.activityType === 'reflection'
        ? '¡Reflexión enviada!'
        : '¡Evidencia enviada!';

      await this.gamification.awardXP(xpAmount, 'evidence');
      await this.gamification.recordActivity();
      await this.gamification.checkStreak();
      await this.feedback.achievement();

      this.showCelebration = true;
    } catch {
      await this.feedback.error();
      await this.toast.show('Error al enviar la evidencia', 'danger');
    } finally {
      this.loading = false;
    }
  }

  onCelebrationDismiss(): void {
    this.showCelebration = false;
    this.nav.back();
  }
}
