import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-place-card',
  template: `
    <button
      type="button"
      class="place-card"
      [class.selected]="selected"
      (click)="selectedPlace.emit(place)"
    >
      <img [src]="place.image" [alt]="i18n.localize(place.alt)" loading="lazy" />
      <span class="eyebrow">{{ place.category }}</span>
      <strong>{{ i18n.localize(place.name) }}</strong>
      <span>{{ i18n.localize(place.shortDescription) }}</span>
      <small>{{
        place.isVerifiedContent ? i18n.t('explore.verified') : i18n.t('explore.notVerified')
      }}</small>
    </button>
  `,
})
export class PlaceCardComponent {
  readonly i18n = inject(LanguageService);
  @Input({ required: true }) place!: Place;
  @Input() selected = false;
  @Output() selectedPlace = new EventEmitter<Place>();
}
