import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { CommunityService } from '../../../core/services/community';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
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
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class PostFormComponent {
  private communityService = inject(CommunityService);
  private nav = inject(NavigationService);
  private toast = inject(ToastService);

  title = '';
  content = '';
  category: string | null = null;
  saving = false;

  async save(): Promise<void> {
    if (!this.title.trim() || this.title.trim().length < 3) {
      await this.toast.show('El titulo debe tener al menos 3 caracteres', 'warning');
      return;
    }

    if (!this.content.trim() || this.content.trim().length < 10) {
      await this.toast.show('El contenido debe tener al menos 10 caracteres', 'warning');
      return;
    }

    this.saving = true;
    try {
      await this.communityService.createPostAsync({
        title: this.title.trim(),
        content: this.content.trim(),
        category: this.category,
      });
      await this.toast.show('Publicacion creada', 'success');
      this.nav.back();
    } catch {
      await this.toast.show('Error al crear la publicacion');
    } finally {
      this.saving = false;
    }
  }
}
