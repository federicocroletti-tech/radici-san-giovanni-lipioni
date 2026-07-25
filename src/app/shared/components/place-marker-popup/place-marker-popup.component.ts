import { Component, Input, inject } from '@angular/core';
import { Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-place-marker-popup',
  template: `
    @if (place) {
      <strong>{{ i18n.localize(place.name) }}</strong>
      <span>{{ i18n.localize(place.shortDescription) }}</span>
    }
  `,
})
export class PlaceMarkerPopupComponent {
  readonly i18n = inject(LanguageService);
  @Input() place: Place | null = null;
}
