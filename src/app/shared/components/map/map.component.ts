import {
  afterNextRender,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { MAP_TILE_LAYER, SAN_GIOVANNI_LIPIONI_CENTER } from '../../../core/constants/map.constants';
import { hasPlaceCoordinates, Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

type LeafletModule = typeof import('leaflet');
type LeafletImport = LeafletModule & { default?: LeafletModule };

@Component({
  selector: 'app-map',
  template: `<div
    class="map-canvas"
    #mapContainer
    role="region"
    tabindex="0"
    [attr.aria-label]="i18n.t('explore.mapAreaLabel')"
  ></div>
  @if (mapError()) {
    <p class="error-message" role="alert">{{ i18n.t('explore.mapError') }}</p>
  }`,
})
export class MapComponent implements OnChanges, OnDestroy {
  readonly i18n = inject(LanguageService);
  readonly mapError = signal(false);
  private leaflet?: LeafletModule;
  private map?: import('leaflet').Map;
  private markerLayer?: import('leaflet').LayerGroup;
  private resizeObserver?: ResizeObserver;
  private destroyed = false;

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;
  @Input() places: Place[] = [];
  @Input() selectedPlaceId: string | null = null;
  @Input() userLocation: { latitude: number; longitude: number } | null = null;
  @Output() placeSelected = new EventEmitter<Place>();

  constructor() {
    afterNextRender(async () => {
      try {
        const leafletImport = await import('leaflet');
        if (this.destroyed) return;
        this.leaflet = this.resolveLeafletModule(leafletImport);
        this.map = this.leaflet
          .map(this.mapContainer.nativeElement, { scrollWheelZoom: false })
          .setView(
            [SAN_GIOVANNI_LIPIONI_CENTER.latitude, SAN_GIOVANNI_LIPIONI_CENTER.longitude],
            SAN_GIOVANNI_LIPIONI_CENTER.zoom,
          );
        this.leaflet
          .tileLayer(MAP_TILE_LAYER.url, { attribution: MAP_TILE_LAYER.attribution })
          .addTo(this.map);
        this.markerLayer = this.leaflet.layerGroup().addTo(this.map);
        this.resizeObserver = new ResizeObserver(() =>
          this.map?.invalidateSize({ pan: false }),
        );
        this.resizeObserver.observe(this.mapContainer.nativeElement);
        this.renderMarkers();
        queueMicrotask(() => this.map?.invalidateSize());
      } catch (error) {
        console.error('Unable to initialize the Leaflet map.', error);
        if (!this.destroyed) this.mapError.set(true);
      }
    });
  }

  ngOnChanges(): void {
    this.renderMarkers();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private renderMarkers(): void {
    if (!this.leaflet || !this.markerLayer) {
      return;
    }

    this.markerLayer.clearLayers();

    const placesWithCoordinates = this.places.filter(hasPlaceCoordinates);
    const selectedPlace = this.places.find((place) => place.id === this.selectedPlaceId);

    for (const place of placesWithCoordinates) {
      const markerName = this.i18n.localize(place.name);
      const marker = this.leaflet.marker([place.latitude, place.longitude], {
        keyboard: true,
        title: markerName,
        alt: markerName,
        icon: this.leaflet.divIcon({
          className: `map-marker ${this.selectedPlaceId === place.id ? 'selected' : ''}`,
          html: '<span></span>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      });

      marker.bindTooltip(this.escape(markerName), {
        direction: 'top',
        offset: [0, -28],
      });
      marker.on('click', () => this.placeSelected.emit(place));
      marker.addTo(this.markerLayer);
      marker.getElement()?.setAttribute('aria-label', markerName);
      marker.getElement()?.setAttribute('role', 'button');
    }

    if (this.userLocation) {
      this.leaflet
        .circleMarker([this.userLocation.latitude, this.userLocation.longitude], {
          radius: 8,
          color: '#fff',
          weight: 3,
          fillColor: '#1f6f54',
          fillOpacity: 1,
        })
        .bindTooltip(this.i18n.t('explore.youAreHere'))
        .addTo(this.markerLayer);
    }

    if (selectedPlace && hasPlaceCoordinates(selectedPlace)) {
      this.map?.panTo([selectedPlace.latitude, selectedPlace.longitude]);
      return;
    }

    if (this.userLocation) {
      this.map?.panTo([this.userLocation.latitude, this.userLocation.longitude]);
      return;
    }

    if (!selectedPlace && placesWithCoordinates.length > 1) {
      const bounds = this.leaflet.latLngBounds(
        placesWithCoordinates.map((place) => [place.latitude, place.longitude] as [number, number]),
      );
      this.map?.fitBounds(bounds.pad(0.18), { maxZoom: 16 });
    }
  }

  private escape(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return entities[character];
    });
  }

  private resolveLeafletModule(leafletImport: LeafletImport): LeafletModule {
    return typeof leafletImport.map === 'function' ? leafletImport : leafletImport.default!;
  }
}
