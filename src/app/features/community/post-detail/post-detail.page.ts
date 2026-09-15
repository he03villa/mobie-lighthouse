import { Component, inject } from '@angular/core';
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
  IonIcon,
  IonInput,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  chatbubbleOutline,
  heartOutline,
  heart,
  thumbsUpOutline,
  thumbsUp,
  bulbOutline,
  bulb,
} from 'ionicons/icons';
import { CommunityService } from '../../../core/services/community';
import { ForumPost, ForumComment, ReactionType } from '../../../core/models/community';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NavigationService } from '../../../core/services/navigation';
import { ToastService } from '../../../core/services/toast';
import { AuthService } from '../../../core/services/auth';
import { ActiveTenantService } from '../../../core/services/active-tenant';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
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
    IonIcon,
    IonInput,
    IonRefresher,
    IonRefresherContent,
    LoadingSpinnerComponent,
  ],
})
export class PostDetailPage {
  private route = inject(ActivatedRoute);
  private communityService = inject(CommunityService);
  private nav = inject(NavigationService);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private activeTenantService = inject(ActiveTenantService);

  loading = true;
  post: ForumPost | null = null;
  newComment = '';
  currentUserId = '';
  sendingComment = false;

  constructor() {
    addIcons({ trashOutline, chatbubbleOutline, heartOutline, heart, thumbsUpOutline, thumbsUp, bulbOutline, bulb });
  }

  get isCoach(): boolean {
    return this.activeTenantService.isCoachOrAbove();
  }

  async ionViewWillEnter(): Promise<void> {
    const user = this.authService.getUser();
    this.currentUserId = user?.id ?? '';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadPost(id);
    }
  }

  async loadPost(id: string): Promise<void> {
    this.loading = true;
    try {
      this.post = await this.communityService.getPostAsync(id);
    } finally {
      this.loading = false;
    }
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    if (this.post) {
      await this.loadPost(this.post.id);
    }
    (event.target as HTMLIonRefresherElement).complete();
  }

  async deletePost(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar publicacion',
      message: 'Estas seguro de que deseas eliminar esta publicacion?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (this.post) {
              await this.communityService.deletePostAsync(this.post.id);
              await this.toast.show('Publicacion eliminada', 'success');
              this.nav.forward('/community');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  canDeletePost(): boolean {
    if (!this.post) return false;
    return this.post.author_user_id === this.currentUserId || this.isCoach;
  }

  async addComment(): Promise<void> {
    const content = this.newComment.trim();
    if (!content || !this.post || this.sendingComment) return;

    this.sendingComment = true;
    try {
      const comment = await this.communityService.createCommentAsync(this.post.id, { content });
      this.post = {
        ...this.post,
        comments: [...(this.post.comments ?? []), comment],
        comments_count: this.post.comments_count + 1,
      };
      this.newComment = '';
    } catch {
      await this.toast.show('Error al agregar comentario');
    } finally {
      this.sendingComment = false;
    }
  }

  async deleteComment(comment: ForumComment): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar comentario',
      message: 'Estas seguro de que deseas eliminar este comentario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.communityService.deleteCommentAsync(comment.id);
            if (this.post) {
              this.post = {
                ...this.post,
                comments: this.post.comments?.filter(c => c.id !== comment.id) ?? [],
                comments_count: this.post.comments_count - 1,
              };
            }
            await this.toast.show('Comentario eliminado', 'success');
          },
        },
      ],
    });
    await alert.present();
  }

  canDeleteComment(comment: ForumComment): boolean {
    return comment.author_user_id === this.currentUserId || this.isCoach;
  }

  async toggleReaction(type: ReactionType): Promise<void> {
    if (!this.post) return;
    await this.communityService.togglePostReactionAsync(this.post.id, type);
    await this.loadPost(this.post.id);
  }

  formatTime(date: string | null | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
