import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Source } from '../../core/models/source.model';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { SourcesService } from '../../core/services/sources.service';

@Component({
  selector: 'app-source-registry-page',
  template: `
    <section class="page-heading">
      <p class="eyebrow">{{ i18n.t('sourceRegistry.eyebrow') }}</p>
      <h1>{{ i18n.t('sourceRegistry.title') }}</h1>
      <p>{{ i18n.t('sourceRegistry.intro') }}</p>
    </section>

    @if (dataLoadError()) {
      <p class="error-message" role="alert">
        {{ i18n.t('app.dataLoadError') }}
        <button type="button" class="text-button" (click)="loadData()">
          {{ i18n.t('actions.retry') }}
        </button>
      </p>
    }

    <section class="card-list">
      @for (source of sources(); track source.id) {
        <article class="content-card">
          <p class="eyebrow">{{ source.creator }}</p>
          <h2>{{ source.title }}</h2>
          <p>{{ source.citation }}</p>
          <p class="muted">
            {{ i18n.t('sourceRegistry.consultedAt') }}: {{ source.consultedAt }}
          </p>
          <a [href]="source.url" target="_blank" rel="noopener">{{
            i18n.t('sourceRegistry.openSource')
          }}</a>
        </article>
      }
    </section>
  `,
})
export class SourceRegistryPage {
  readonly i18n = inject(LanguageService);
  readonly sources = signal<Source[]>([]);
  readonly dataLoadError = signal(false);
  private readonly sourcesService = inject(SourcesService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    inject(SeoService).usePage('sourceRegistry');
    this.loadData();
  }

  loadData(): void {
    this.dataLoadError.set(false);
    this.sourcesService
      .getSources()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sources) => this.sources.set(sources),
        error: () => this.dataLoadError.set(true),
      });
  }
}
