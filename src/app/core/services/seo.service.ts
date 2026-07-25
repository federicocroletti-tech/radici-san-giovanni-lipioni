import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(LanguageService);
  private readonly pageKey = signal('home');

  constructor() {
    effect(() => {
      const key = this.pageKey();
      const pageTitle = this.language.t(`seo.${key}.title`);
      const description = this.language.t(`seo.${key}.description`);
      const canonical = this.language.t(`seo.${key}.canonical`);

      this.title.setTitle(pageTitle);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: pageTitle });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.updateCanonical(canonical);
      this.updateJsonLd(key);
    });
  }

  usePage(pageKey: string): void {
    this.pageKey.set(pageKey);
  }

  private updateCanonical(path: string): void {
    const href = new URL(path || '/', this.document.location.origin).toString();
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', href);
  }

  private updateJsonLd(pageKey: string): void {
    const existing = this.document.getElementById('radici-json-ld');
    existing?.remove();

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'radici-json-ld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': pageKey === 'home' ? 'WebSite' : 'WebPage',
      name: this.language.t('app.name'),
      description: this.language.t(`seo.${pageKey}.description`),
      url: new URL(
        this.language.t(`seo.${pageKey}.canonical`) || '/',
        this.document.location.origin,
      ).toString(),
      inLanguage: this.language.currentLanguage(),
    });
    this.document.head.appendChild(script);
  }
}
