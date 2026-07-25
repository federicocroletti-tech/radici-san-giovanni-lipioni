import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  imports: [FormsModule],
  template: `
    <label class="field">
      <span>{{ label }}</span>
      <input
        type="search"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (ngModelChange)="valueChange.emit($event)"
      />
    </label>
  `,
})
export class SearchInputComponent {
  @Input({ required: true }) label = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}
