import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { SAN_GIOVANNI_LIPIONI_CENTER } from '../../../core/constants/map.constants';
import { LanguageService } from '../../../core/services/language.service';

type LeafletModule = typeof import('leaflet');
type LeafletImport = LeafletModule & { default?: LeafletModule };

@Component({
  selector: 'app-location-map',
  template: `
    <section class="section location-section" aria-labelledby="location-title">
      <div class="location-copy">
        <p class="eyebrow">{{ i18n.t('location.kicker') }}</p>
        <h2 id="location-title">{{ i18n.t('location.title') }}</h2>
        <p>{{ i18n.t('location.intro') }}</p>
        <dl class="location-data">
          <div>
            <dt>{{ i18n.t('location.provinceLabel') }}</dt>
            <dd>{{ i18n.t('location.province') }}</dd>
          </div>
          <div>
            <dt>{{ i18n.t('location.regionLabel') }}</dt>
            <dd>{{ i18n.t('location.region') }}</dd>
          </div>
          <div>
            <dt>{{ i18n.t('location.coordinatesLabel') }}</dt>
            <dd>{{ coordinates }}</dd>
          </div>
        </dl>
        <a class="button" [href]="googleMapsUrl" target="_blank" rel="noopener">
          {{ i18n.t('location.openGoogleMaps') }}
        </a>
      </div>
      <div class="location-map-card">
        <p class="map-loading" aria-hidden="true">{{ i18n.t('location.loading') }}</p>
        <div
          class="location-map-canvas"
          #mapContainer
          role="img"
          [attr.aria-label]="i18n.t('location.mapLabel')"
        ></div>
      </div>
    </section>
  `,
})
export class LocationMapComponent implements OnDestroy {
  readonly i18n = inject(LanguageService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly coordinates = `${SAN_GIOVANNI_LIPIONI_CENTER.latitude.toFixed(6)}, ${SAN_GIOVANNI_LIPIONI_CENTER.longitude.toFixed(6)}`;
  readonly googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${SAN_GIOVANNI_LIPIONI_CENTER.latitude},${SAN_GIOVANNI_LIPIONI_CENTER.longitude}`;
  private map?: import('leaflet').Map;

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    if (!this.isBrowser) return;

    afterNextRender(async () => {
      const leaflet = this.resolveLeafletModule(await import('leaflet'));
      this.map = leaflet
        .map(this.mapContainer.nativeElement, {
          attributionControl: true,
          scrollWheelZoom: false,
          zoomControl: true,
        })
        .setView([SAN_GIOVANNI_LIPIONI_CENTER.latitude, SAN_GIOVANNI_LIPIONI_CENTER.longitude], 12);

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        })
        .addTo(this.map);

      leaflet
        .marker([SAN_GIOVANNI_LIPIONI_CENTER.latitude, SAN_GIOVANNI_LIPIONI_CENTER.longitude], {
          icon: leaflet.divIcon({
            className: 'map-marker selected location-marker',
            html: '<span></span>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          }),
        })
        .bindTooltip(this.i18n.t('location.markerLabel'), { direction: 'top', offset: [0, -28] })
        .addTo(this.map);

      queueMicrotask(() => this.map?.invalidateSize());
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private resolveLeafletModule(leafletImport: LeafletImport): LeafletModule {
    return typeof leafletImport.map === 'function' ? leafletImport : leafletImport.default!;
  }
}
