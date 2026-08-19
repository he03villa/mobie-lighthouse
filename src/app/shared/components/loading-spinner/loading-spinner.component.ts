import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSpinner, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonSpinner, IonLabel],
})
export class LoadingSpinnerComponent {
  @Input() message = '';
}
