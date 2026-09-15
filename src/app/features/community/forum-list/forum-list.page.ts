import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonIcon,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleCircleOutline, chatbubbleOutline, pinOutline } from 'ionicons/icons';
import { CommunityService } from '../../../core/services/community';
import { ForumPost } from '../../../core/models/community';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { NavigationService } from '../../../core/services/navigation';
import { ActiveTenantService } from '../../../core/services/active-tenant';

@Component({
  selector: 'app-forum-list',
  templateUrl: './forum-list.page.html',
  styleUrls: ['./forum-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardContent,
    IonIcon,
    IonChip,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
})
export class ForumListPage {
  private communityService = inject(CommunityService);
  private nav = inject(NavigationService);
  private activeTenantService = inject(ActiveTenantService);

  loading = true;
  posts: ForumPost[] = [];
  filteredPosts: ForumPost[] = [];
  selectedCategory: string | null = null;
  searchTerm = '';

  constructor() {
    addIcons({ peopleCircleOutline, chatbubbleOutline, pinOutline });
  }

  get isCoach(): boolean {
    return this.activeTenantService.isCoachOrAbove();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadPosts();
  }

  async loadPosts(): Promise<void> {
    this.loading = true;
    try {
      this.posts = await this.communityService.listPostsAsync(this.selectedCategory ?? undefined);
      this.applyFilter();
    } catch {
      this.posts = [];
      this.filteredPosts = [];
    } finally {
      this.loading = false;
    }
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPosts = this.posts;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPosts = this.posts.filter(
        p => p.title?.toLowerCase().includes(term) ||
          p.content?.toLowerCase().includes(term) ||
          p.author?.name?.toLowerCase().includes(term)
      );
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchTerm = target.value ?? '';
    this.applyFilter();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    await this.loadPosts();
    (event.target as HTMLIonRefresherElement).complete();
  }

  openPost(post: ForumPost): void {
    this.nav.forward(`/community/${post.id}`);
  }

  navigateToCreate(): void {
    this.nav.forward('/community/new');
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
    this.loadPosts();
  }

  formatTime(date: string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }

  truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
}
