import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class EmptyStateComponent {
  @Input() icon = 'folder-open-outline';
  @Input() title = 'Sin resultados';
  @Input() subtitle = '';
}
