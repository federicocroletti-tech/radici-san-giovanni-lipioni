import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Source } from '../../core/models/source.model';
import { TimelineEvent, TimelineKind } from '../../core/models/timeline-event.model';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { SourcesService } from '../../core/services/sources.service';
import { TimelineService } from '../../core/services/timeline.service';

@Component({
  selector: 'app-timeline-page',
  template: `
    <section class="page-heading">
      <p class="eyebrow">{{ i18n.t('timeline.eyebrow') }}</p>
      <h1>{{ i18n.t('timeline.title') }}</h1>
      <p>{{ i18n.t('timeline.intro') }}</p>
    </section>

    @if (dataLoadError()) {
      <p class="error-message" role="alert">
        {{ i18n.t('app.dataLoadError') }}
        <button type="button" class="text-button" (click)="loadData()">
          {{ i18n.t('actions.retry') }}
        </button>
      </p>
    }

    <section class="section compact">
      <label class="field narrow">
        <span>{{ i18n.t('timeline.kindLabel') }}</span>
        <select [value]="selectedKind()" (change)="selectedKind.set($any($event.target).value)">
          <option value="all">{{ i18n.t('timeline.allKinds') }}</option>
          @for (kind of kinds; track kind) {
            <option [value]="kind">{{ i18n.t('timeline.kinds.' + kind) }}</option>
          }
        </select>
      </label>
    </section>

    @if (!dataLoadError() && filteredEvents().length === 0) {
      <p class="muted">{{ i18n.t('timeline.empty') }}</p>
    }

    <section class="card-list">
      @for (event of filteredEvents(); track event.id) {
        <article class="content-card timeline-card">
          <p class="eyebrow">
            {{ event.dateLabel }} · {{ i18n.t('timeline.kinds.' + event.kind) }}
          </p>
          <h2>{{ i18n.localize(event.title) }}</h2>
          <p>{{ i18n.localize(event.summary) }}</p>
          <p class="muted">{{ i18n.t('sourceStatus.' + event.sourceStatus) }}</p>
          @if (sourcesFor(event).length) {
            <p class="muted">{{ i18n.t('timeline.sourcesLabel') }}</p>
            <ul>
              @for (source of sourcesFor(event); track source.id) {
                <li>
                  <a [href]="source.url" target="_blank" rel="noopener">{{ source.creator }}</a>
                </li>
              }
            </ul>
          }
          @if (event.placeId) {
            <button type="button" class="button small" (click)="openPlace(event.placeId)">
              {{ i18n.t('actions.openOnMap') }}
            </button>
          }
        </article>
      }
    </section>
  `,
})
export class TimelinePage {
  readonly i18n = inject(LanguageService);
  readonly kinds: TimelineKind[] = ['sismico', 'storico', 'persona', 'emigrazione', 'tradizione'];
  readonly events = signal<TimelineEvent[]>([]);
  readonly sources = signal<Source[]>([]);
  readonly selectedKind = signal<'all' | TimelineKind>('all');
  readonly dataLoadError = signal(false);
  private readonly timelineService = inject(TimelineService);
  private readonly sourcesService = inject(SourcesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly filteredEvents = computed(() => {
    const kind = this.selectedKind();
    const verified = this.events().filter((event) => event.sourceStatus === 'verified');
    return kind === 'all' ? verified : verified.filter((event) => event.kind === kind);
  });

  constructor() {
    inject(SeoService).usePage('timeline');
    this.loadData();
  }

  loadData(): void {
    this.dataLoadError.set(false);
    this.timelineService
      .getEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => this.events.set(events),
        error: () => this.dataLoadError.set(true),
      });
    this.sourcesService
      .getSources()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sources) => this.sources.set(sources),
        error: () => this.dataLoadError.set(true),
      });
  }

  sourcesFor(event: TimelineEvent): Source[] {
    return event.sourceIds
      .map((sourceId) => this.sources().find((source) => source.id === sourceId))
      .filter((source): source is Source => Boolean(source));
  }

  openPlace(placeId: string): void {
    void this.router.navigate(['/esplora'], { queryParams: { place: placeId } });
  }
}
