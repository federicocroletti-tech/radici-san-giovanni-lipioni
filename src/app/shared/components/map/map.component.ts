import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { MAP_TILE_LAYER, SAN_GIOVANNI_LIPIONI_CENTER } from '../../../core/constants/map.constants';
import { Place } from '../../../core/models/place.model';
import { LanguageService } from '../../../core/services/language.service';

type LeafletModule = typeof import('leaflet');

@Component({
  selector: 'app-map',
  template: `<div class="map-canvas" #mapContainer aria-label="Interactive map"></div>`,
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly i18n = inject(LanguageService);
  private leaflet?: LeafletModule;
  private map?: import('leaflet').Map;
  private markerLayer?: import('leaflet').LayerGroup;

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;
  @Input() places: Place[] = [];
  @Input() selectedPlaceId: string | null = null;
  @Output() placeSelected = new EventEmitter<Place>();

  async ngAfterViewInit(): Promise<void> {
    this.leaflet = await import('leaflet');
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
    this.renderMarkers();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.renderMarkers();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private renderMarkers(): void {
    if (!this.leaflet || !this.markerLayer) {
      return;
    }

    this.markerLayer.clearLayers();

    const selectedPlace = this.places.find((place) => place.id === this.selectedPlaceId);

    for (const place of this.places) {
      const marker = this.leaflet.marker([place.latitude, place.longitude], {
        icon: this.leaflet.divIcon({
          className: `map-marker ${this.selectedPlaceId === place.id ? 'selected' : ''}`,
          html: '<span></span>',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        }),
      });

      marker.bindTooltip(this.escape(this.i18n.localize(place.name)), {
        direction: 'top',
        offset: [0, -28],
      });
      marker.on('click', () => this.placeSelected.emit(place));
      marker.addTo(this.markerLayer);
    }

    if (selectedPlace) {
      this.map?.panTo([selectedPlace.latitude, selectedPlace.longitude]);
      return;
    }

    if (this.places.length > 1) {
      const bounds = this.leaflet.latLngBounds(
        this.places.map((place) => [place.latitude, place.longitude] as [number, number]),
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
}
