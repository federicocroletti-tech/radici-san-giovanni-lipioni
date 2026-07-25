import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Place, PlaceCategory } from '../../core/models/place.model';
import { LanguageService } from '../../core/services/language.service';
import { PlacesService } from '../../core/services/places.service';
import { SeoService } from '../../core/services/seo.service';
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
      <aside class="filters-panel" [attr.aria-label]="i18n.t('explore.filtersLabel')">
        <app-search-input
          [label]="i18n.t('explore.searchLabel')"
          [placeholder]="i18n.t('explore.searchPlaceholder')"
          [value]="search()"
          (valueChange)="search.set($event)"
        />
        <app-category-filter
          [categories]="categories()"
          [selectedCategory]="selectedCategory()"
          [label]="i18n.t('explore.categoryLabel')"
          [allLabel]="i18n.t('explore.allCategories')"
          (selectedCategoryChange)="selectedCategory.set($event)"
        />
        <button type="button" class="text-button" (click)="clearFilters()">
          {{ i18n.t('actions.clearFilters') }}
        </button>
      </aside>

      <div class="map-panel">
        <app-map
          [places]="filteredPlaces()"
          [selectedPlaceId]="selectedPlaceId()"
          (placeSelected)="selectPlace($event)"
        />
      </div>

      <aside class="places-panel">
        <app-place-detail-drawer [place]="selectedPlace()" (closed)="selectedPlaceId.set(null)" />
      </aside>
    </section>
  `,
})
export class ExplorePage {
  readonly i18n = inject(LanguageService);
  readonly places = signal<Place[]>([]);
  readonly categories = signal<PlaceCategory[]>([]);
  readonly search = signal('');
  readonly selectedCategory = signal('all');
  readonly selectedPlaceId = signal<string | null>(null);
  readonly routePlaceIds = signal<string[]>([]);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly filteredPlaces = computed(() => {
    const query = this.normalize(this.search());
    const category = this.selectedCategory();
    const routeIds = this.routePlaceIds();

    return this.places().filter((place) => {
      const matchesCategory = category === 'all' || place.category === category;
      const matchesRoute = routeIds.length === 0 || routeIds.includes(place.id);
      const haystack = [
        this.i18n.localize(place.name),
        this.i18n.localize(place.shortDescription),
        place.category,
        ...place.tags,
      ]
        .map((value) => this.normalize(value))
        .join(' ');
      const matchesQuery = !query || haystack.includes(query);
      return matchesCategory && matchesRoute && matchesQuery;
    });
  });

  readonly selectedPlace = computed(
    () => this.places().find((place) => place.id === this.selectedPlaceId()) ?? null,
  );

  constructor() {
    inject(SeoService).usePage('explore');
    const placesService = inject(PlacesService);
    placesService
      .getPlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((places) => this.places.set(places));
    placesService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => this.categories.set(categories));
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.selectedPlaceId.set(params.get('place'));
      this.routePlaceIds.set((params.get('places') ?? '').split(',').filter(Boolean));
    });
  }

  selectPlace(place: Place): void {
    this.selectedPlaceId.set(place.id);
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedCategory.set('all');
    this.routePlaceIds.set([]);
    void this.router.navigate(['/esplora']);
  }

  private normalize(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
