import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Place, PlaceCategory } from '../../core/models/place.model';
import { LanguageService } from '../../core/services/language.service';
import { PlacesService } from '../../core/services/places.service';
import { SeoService } from '../../core/services/seo.service';
import { VisitorPlacesService } from '../../core/services/visitor-places.service';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { MapComponent } from '../../shared/components/map/map.component';
import { PlaceDetailDrawerComponent } from '../../shared/components/place-detail-drawer/place-detail-drawer.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-explore-page',
  imports: [
    CategoryFilterComponent,
    MapComponent,
    PlaceDetailDrawerComponent,
    SearchInputComponent,
  ],
  template: `
    <section class="page-heading compact-heading">
      <p class="eyebrow">{{ i18n.t('app.demoNotice') }}</p>
      <h1>{{ i18n.t('explore.title') }}</h1>
      <p>{{ i18n.t('explore.intro') }}</p>
    </section>

    <section class="explore-layout" [attr.aria-label]="i18n.t('explore.mapAreaLabel')">
      <nav class="mobile-tabs" role="tablist" [attr.aria-label]="i18n.t('explore.mobileViewLabel')">
        <button
          type="button"
          role="tab"
          id="explore-map-tab"
          aria-controls="explore-map-panel"
          [attr.aria-selected]="mobileView() === 'map'"
          [class.active]="mobileView() === 'map'"
          (click)="setMobileView('map')"
        >
          {{ i18n.t('explore.mapTab') }}
        </button>
        <button
          type="button"
          role="tab"
          id="explore-list-tab"
          aria-controls="explore-list-panel"
          [attr.aria-selected]="mobileView() === 'list'"
          [class.active]="mobileView() === 'list'"
          (click)="setMobileView('list')"
        >
          {{ i18n.t('explore.listTab') }} ({{ filteredPlaces().length }})
        </button>
      </nav>

      <aside
        id="explore-list-panel"
        class="filters-panel"
        role="tabpanel"
        aria-labelledby="explore-list-tab"
        [class.mobile-hidden]="mobileView() === 'map'"
        [attr.aria-label]="i18n.t('explore.filtersLabel')"
      >
        <app-search-input
          [label]="i18n.t('explore.searchLabel')"
          [placeholder]="i18n.t('explore.searchPlaceholder')"
          [value]="search()"
          (valueChange)="setSearch($event)"
        />
        <app-category-filter
          [categories]="categories()"
          [selectedCategory]="selectedCategory()"
          [label]="i18n.t('explore.categoryLabel')"
          [allLabel]="i18n.t('explore.allCategories')"
          (selectedCategoryChange)="setCategory($event)"
        />
        <div class="chips" [attr.aria-label]="i18n.t('explore.collectionLabel')">
          <button
            type="button"
            class="chip"
            [class.active]="collection() === 'all'"
            (click)="setCollection('all')"
          >
            {{ i18n.t('explore.allPlaces') }}
          </button>
          <button
            type="button"
            class="chip"
            [class.active]="collection() === 'favorites'"
            (click)="setCollection('favorites')"
          >
            {{ i18n.t('explore.favorites') }} ({{ visitorPlaces.favorites().length }})
          </button>
          <button
            type="button"
            class="chip"
            [class.active]="collection() === 'visited'"
            (click)="setCollection('visited')"
          >
            {{ i18n.t('explore.visited') }} ({{ visitorPlaces.visited().length }})
          </button>
        </div>
        <button type="button" class="text-button" (click)="clearFilters()">
          {{ i18n.t('actions.clearFilters') }}
        </button>
        <button type="button" class="text-button" (click)="locateMe()" [disabled]="locating()">
          {{ i18n.t(locating() ? 'explore.locating' : 'explore.locateMe') }}
        </button>
        <div class="quick-place-list" [attr.aria-label]="i18n.t('explore.results')">
          @for (place of filteredPlaces(); track place.id) {
            <button
              type="button"
              class="chip"
              [class.active]="selectedPlaceId() === place.id"
              (click)="selectPlace(place)"
            >
              {{ i18n.localize(place.name) }}
            </button>
          } @empty {
            <span class="muted">{{ i18n.t('explore.noResults') }}</span>
          }
        </div>
      </aside>

      <div
        id="explore-map-panel"
        class="map-panel"
        role="tabpanel"
        aria-labelledby="explore-map-tab"
        [class.mobile-hidden]="mobileView() === 'list'"
      >
        <app-map
          [places]="filteredPlaces()"
          [selectedPlaceId]="selectedPlaceId()"
          [userLocation]="userLocation()"
          (placeSelected)="selectPlace($event)"
        />
      </div>

      <aside class="places-panel" [class.mobile-hidden]="mobileView() === 'map' && !selectedPlace()">
        <app-place-detail-drawer
          [place]="selectedPlace()"
          [relatedPlaces]="relatedPlaces()"
          (closed)="closePlace()"
          (placeSelected)="selectPlace($event)"
        />
      </aside>
    </section>
    @if (locationMessage()) {
      <p class="location-message" role="status">{{ locationMessage() }}</p>
    }
    @if (dataLoadError()) {
      <p class="error-message" role="alert">
        {{ i18n.t('app.dataLoadError') }}
        <button type="button" class="text-button" (click)="loadData()">
          {{ i18n.t('actions.retry') }}
        </button>
      </p>
    }
    @if (!visitorPlaces.persistenceAvailable()) {
      <p class="muted" role="status">{{ i18n.t('explore.savedPlacesNotPersisted') }}</p>
    }
  `,
})
export class ExplorePage {
  readonly i18n = inject(LanguageService);
  readonly places = signal<Place[]>([]);
  readonly categories = signal<PlaceCategory[]>([]);
  readonly search = signal('');
  readonly selectedCategory = signal('all');
  readonly collection = signal<'all' | 'favorites' | 'visited'>('all');
  readonly selectedPlaceId = signal<string | null>(null);
  readonly routePlaceIds = signal<string[]>([]);
  readonly mobileView = signal<'map' | 'list'>('list');
  readonly dataLoadError = signal(false);
  readonly userLocation = signal<{ latitude: number; longitude: number } | null>(null);
  readonly locating = signal(false);
  readonly locationMessage = signal('');
  readonly visitorPlaces = inject(VisitorPlacesService);
  private readonly placesService = inject(PlacesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly filteredPlaces = computed(() => {
    const query = this.normalize(this.search());
    const category = this.selectedCategory();
    const routeIds = this.routePlaceIds();
    const collection = this.collection();

    return this.places().filter((place) => {
      const matchesCategory = category === 'all' || place.category === category;
      const matchesRoute = routeIds.length === 0 || routeIds.includes(place.id);
      const matchesCollection =
        collection === 'all' ||
        (collection === 'favorites' && this.visitorPlaces.isFavorite(place.id)) ||
        (collection === 'visited' && this.visitorPlaces.isVisited(place.id));
      const haystack = [
        this.i18n.localize(place.name),
        this.i18n.localize(place.shortDescription),
        place.category,
        ...place.tags,
      ]
        .map((value) => this.normalize(value))
        .join(' ');
      const matchesQuery = !query || haystack.includes(query);
      return matchesCategory && matchesRoute && matchesCollection && matchesQuery;
    });
  });

  readonly selectedPlace = computed(
    () => this.places().find((place) => place.id === this.selectedPlaceId()) ?? null,
  );

  readonly relatedPlaces = computed(() => {
    const selectedPlace = this.selectedPlace();
    if (!selectedPlace) {
      return [];
    }

    return selectedPlace.relatedPlaceIds
      .map((placeId) => this.places().find((place) => place.id === placeId))
      .filter((place): place is Place => Boolean(place));
  });

  constructor() {
    inject(SeoService).usePage('explore');
    this.loadData();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.selectedPlaceId.set(params.get('place'));
      this.routePlaceIds.set((params.get('places') ?? '').split(',').filter(Boolean));
      this.search.set(params.get('q') ?? '');
      this.selectedCategory.set(params.get('category') ?? 'all');
      const collection = params.get('collection');
      this.collection.set(
        collection === 'favorites' || collection === 'visited' ? collection : 'all',
      );
      const requestedView = params.get('view');
      this.mobileView.set(
        requestedView === 'map'
          ? 'map'
          : requestedView === 'list'
            ? 'list'
            : params.has('place')
              ? 'map'
              : 'list',
      );
    });
  }

  selectPlace(place: Place): void {
    this.selectedPlaceId.set(place.id);
    this.mobileView.set('map');
    this.syncUrl(false);
  }

  closePlace(): void {
    this.selectedPlaceId.set(null);
    this.syncUrl(true);
  }

  setSearch(value: string): void {
    this.search.set(value);
    this.syncUrl(true);
  }

  setCategory(value: string): void {
    this.selectedCategory.set(value);
    this.syncUrl(true);
  }

  setCollection(value: 'all' | 'favorites' | 'visited'): void {
    this.collection.set(value);
    this.syncUrl(true);
  }

  setMobileView(value: 'map' | 'list'): void {
    this.mobileView.set(value);
    this.syncUrl(true);
  }

  locateMe(): void {
    if (!navigator.geolocation) {
      this.locationMessage.set(this.i18n.t('explore.locationUnavailable'));
      return;
    }

    this.locating.set(true);
    this.locationMessage.set('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLocation.set({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.locationMessage.set(this.i18n.t('explore.locationFound'));
        this.locating.set(false);
        this.setMobileView('map');
      },
      (error) => {
        const key =
          error.code === error.PERMISSION_DENIED
            ? 'explore.locationDenied'
            : error.code === error.TIMEOUT
              ? 'explore.locationTimeout'
              : 'explore.locationUnavailable';
        this.locationMessage.set(this.i18n.t(key));
        this.locating.set(false);
      },
      { enableHighAccuracy: false, maximumAge: 30_000, timeout: 10_000 },
    );
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedCategory.set('all');
    this.collection.set('all');
    this.routePlaceIds.set([]);
    this.selectedPlaceId.set(null);
    this.mobileView.set('list');
    void this.router.navigate(['/esplora']);
  }

  loadData(): void {
    this.dataLoadError.set(false);

    this.placesService
      .getPlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (places) => this.places.set(places),
        error: () => this.dataLoadError.set(true),
      });
    this.placesService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: () => this.dataLoadError.set(true),
      });
  }

  private syncUrl(replaceUrl: boolean): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        place: this.selectedPlaceId(),
        places: this.routePlaceIds().length ? this.routePlaceIds().join(',') : null,
        q: this.search().trim() || null,
        category: this.selectedCategory() === 'all' ? null : this.selectedCategory(),
        collection: this.collection() === 'all' ? null : this.collection(),
        view: this.mobileView(),
      },
      replaceUrl,
    });
  }

  private normalize(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
