import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Place } from '../../core/models/place.model';
import { Story } from '../../core/models/story.model';
import { LanguageService } from '../../core/services/language.service';
import { PlacesService } from '../../core/services/places.service';
import { SeoService } from '../../core/services/seo.service';
import { StoriesService } from '../../core/services/stories.service';
import { StoryCardComponent } from '../../shared/components/story-card/story-card.component';

@Component({
  selector: 'app-stories-page',
  imports: [StoryCardComponent],
  template: `
    <section class="page-heading">
      <p class="eyebrow">{{ i18n.t('stories.mockNotice') }}</p>
      <h1>{{ i18n.t('stories.title') }}</h1>
      <p>{{ i18n.t('stories.intro') }}</p>
    </section>

    <section class="section compact">
      <label class="field narrow">
        <span>{{ i18n.t('stories.themeLabel') }}</span>
        <select [value]="selectedTheme()" (change)="selectedTheme.set($any($event.target).value)">
          <option value="all">{{ i18n.t('stories.allThemes') }}</option>
          @for (theme of themes(); track theme) {
            <option [value]="theme">{{ themeLabel(theme) }}</option>
          }
        </select>
      </label>
    </section>

    <section class="card-list">
      @for (story of filteredStories(); track story.id) {
        <app-story-card [story]="story" [places]="places()" (openPlace)="openPlace($event)" />
      }
    </section>
  `,
})
export class StoriesPage {
  readonly i18n = inject(LanguageService);
  readonly stories = signal<Story[]>([]);
  readonly places = signal<Place[]>([]);
  readonly selectedTheme = signal('all');
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly themes = computed(() => Array.from(new Set(this.stories().map((story) => story.theme))));
  readonly filteredStories = computed(() => {
    const theme = this.selectedTheme();
    return theme === 'all'
      ? this.stories()
      : this.stories().filter((story) => story.theme === theme);
  });

  constructor() {
    inject(SeoService).usePage('stories');
    inject(StoriesService)
      .getStories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stories) => this.stories.set(stories));
    inject(PlacesService)
      .getPlaces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((places) => this.places.set(places));
  }

  openPlace(placeId: string): void {
    void this.router.navigate(['/esplora'], { queryParams: { place: placeId } });
  }

  themeLabel(theme: string): string {
    const labels: Record<string, Record<'it' | 'en' | 'fr', string>> = {
      ritorni: { it: 'Ritorni', en: 'Returns', fr: 'Retours' },
      fontana: { it: 'Fontana', en: 'Fountain', fr: 'Fontaine' },
      scalinate: { it: 'Scalinate', en: 'Steps', fr: 'Escaliers' },
    };

    return labels[theme]?.[this.i18n.currentLanguage()] ?? theme;
  }
}
