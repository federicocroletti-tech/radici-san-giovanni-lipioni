import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlaceCategory } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-category-filter',
  imports: [FormsModule],
  template: `
    <label class="field">
      <span>{{ label }}</span>
      <select [ngModel]="selectedCategory" (ngModelChange)="selectedCategoryChange.emit($event)">
        <option value="all">{{ allLabel }}</option>
        @for (category of categories; track category.id) {
          <option [value]="category.id">{{ i18n.localize(category.label) }}</option>
        }
      </select>
    </label>
  `,
})
export class CategoryFilterComponent {
  readonly i18n = inject(LanguageService);
  @Input() categories: PlaceCategory[] = [];
  @Input() selectedCategory = 'all';
  @Input({ required: true }) label = '';
  @Input({ required: true }) allLabel = '';
  @Output() selectedCategoryChange = new EventEmitter<string>();
}
