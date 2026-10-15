import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LanguageService } from './language.service';

const SITE_URL = 'https://radici-san-giovanni-lipioni.onrender.com/';
const DEFAULT_SOCIAL_IMAGE = 'assets/images/san-giovanni-lipioni-borgo.jpg';
const LOCALE_BY_LANGUAGE: Record<string, string> = {
  it: 'it_IT',
  en: 'en_GB',
  fr: 'fr_FR',
};

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
      const canonicalUrl = this.absoluteUrl(canonical || '/');
      const imageUrl = this.absoluteUrl(DEFAULT_SOCIAL_IMAGE);
      const locale = LOCALE_BY_LANGUAGE[this.language.currentLanguage()] ?? 'it_IT';

      this.title.setTitle(pageTitle);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });
      this.meta.updateTag({ property: 'og:title', content: pageTitle });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
      this.meta.updateTag({ property: 'og:image:alt', content: this.language.t('home.title') });
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ property: 'og:site_name', content: this.language.t('app.name') });
      this.meta.updateTag({ property: 'og:locale', content: locale });
      this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.updateCanonical(canonicalUrl);
      this.updateJsonLd(key);
    });
  }

  usePage(pageKey: string): void {
    this.pageKey.set(pageKey);
  }

  private updateCanonical(href: string): void {
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
    const pageUrl = this.absoluteUrl(this.language.t(`seo.${pageKey}.canonical`) || '/');
    const breadcrumbName = this.language.t(`seo.${pageKey}.title`).split('|')[0].trim();
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: this.language.t('app.name'),
        url: SITE_URL,
        logo: this.absoluteUrl(DEFAULT_SOCIAL_IMAGE),
        description: this.language.t('footer.independentNotice'),
      },
      {
        '@type': pageKey === 'home' ? ['WebSite', 'WebPage'] : 'WebPage',
        '@id': `${pageUrl}#webpage`,
        name: this.language.t(`seo.${pageKey}.title`),
        description: this.language.t(`seo.${pageKey}.description`),
        url: pageUrl,
        inLanguage: this.language.currentLanguage(),
        publisher: { '@id': `${SITE_URL}#organization` },
      },
      {
        '@type': 'Place',
        '@id': `${SITE_URL}#san-giovanni-lipioni`,
        name: 'San Giovanni Lipioni',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'San Giovanni Lipioni',
          addressRegion: 'Abruzzo',
          addressCountry: 'IT',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 41.8429366,
          longitude: 14.5621116,
        },
      },
      {
        '@type': 'TouristDestination',
        '@id': `${SITE_URL}#destination`,
        name: 'San Giovanni Lipioni',
        touristType: this.language.t('location.touristType'),
        containsPlace: { '@id': `${SITE_URL}#san-giovanni-lipioni` },
      },
      {
        '@type': 'LandmarksOrHistoricalBuildings',
        '@id': `${SITE_URL}#landmark-santa-maria-delle-grazie`,
        name: 'Chiesa di Santa Maria delle Grazie',
        containedInPlace: { '@id': `${SITE_URL}#san-giovanni-lipioni` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: this.language.t('nav.home'),
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: breadcrumbName,
            item: pageUrl,
          },
        ],
      },
    ];

    if (pageKey === 'stories') {
      graph.push({
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: this.language.t('stories.title'),
        description: this.language.t('stories.intro'),
        author: { '@id': `${SITE_URL}#organization` },
        publisher: { '@id': `${SITE_URL}#organization` },
        mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      });
    }

    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    this.document.head.appendChild(script);
  }

  private absoluteUrl(path: string): string {
    return new URL(path, SITE_URL).toString();
  }
}
