import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-celebration-overlay',
  templateUrl: './celebration-overlay.component.html',
  styleUrls: ['./celebration-overlay.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class CelebrationOverlayComponent implements OnInit, OnDestroy {
  @Input() xpEarned = 15;
  @Input() message = '¡Excelente!';
  @Input() subtitle = '';
  @Input() autoDismissMs = 3500;
  @Output() dismissed = new EventEmitter<void>();

  visible = false;
  displayedXP = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private xpTimer?: ReturnType<typeof setInterval>;

  constructor() { addIcons({ checkmarkCircle }); }

  ngOnInit(): void {
    this.visible = true;
    this.animateXP();
    if (this.autoDismissMs > 0) {
      this.timer = setTimeout(() => this.close(), this.autoDismissMs);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    clearInterval(this.xpTimer);
  }

  close(): void {
    this.visible = false;
    clearTimeout(this.timer);
    clearInterval(this.xpTimer);
    this.dismissed.emit();
  }

  private animateXP(): void {
    const step = Math.max(1, Math.floor(this.xpEarned / 15));
    this.xpTimer = setInterval(() => {
      this.displayedXP = Math.min(this.displayedXP + step, this.xpEarned);
      if (this.displayedXP >= this.xpEarned) clearInterval(this.xpTimer);
    }, 60);
  }

  onBackdropClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('overlay-backdrop')) {
      this.close();
    }
  }
}
