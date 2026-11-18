import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Injectable, inject, PLATFORM_ID, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VisitorPlacesService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly favoritesKey = 'radici-favorite-places';
  private readonly visitedKey = 'radici-visited-places';

  readonly favorites = signal<string[]>([]);
  readonly visited = signal<string[]>([]);
  readonly persistenceAvailable = signal(true);

  constructor() {
    if (!this.isBrowser) return;
    afterNextRender(() => {
      this.favorites.set(this.readIds(this.favoritesKey));
      this.visited.set(this.readIds(this.visitedKey));
    });
  }

  isFavorite(placeId: string): boolean {
    return this.favorites().includes(placeId);
  }

  isVisited(placeId: string): boolean {
    return this.visited().includes(placeId);
  }

  toggleFavorite(placeId: string): void {
    const values = this.toggle(this.favorites(), placeId);
    this.favorites.set(values);
    this.persist(this.favoritesKey, values);
  }

  toggleVisited(placeId: string): void {
    const values = this.toggle(this.visited(), placeId);
    this.visited.set(values);
    this.persist(this.visitedKey, values);
  }

  private toggle(values: string[], placeId: string): string[] {
    const next = new Set(values);
    if (next.has(placeId)) {
      next.delete(placeId);
    } else {
      next.add(placeId);
    }
    return [...next];
  }

  private readIds(key: string): string[] {
    let rawValue: string | null;
    try {
      rawValue = localStorage.getItem(key);
    } catch {
      this.persistenceAvailable.set(false);
      return [];
    }

    try {
      const value: unknown = JSON.parse(rawValue ?? '[]');
      if (!Array.isArray(value) || !value.every((id) => typeof id === 'string')) {
        return [];
      }
      return [...new Set(value.filter((id) => id.length > 0))];
    } catch {
      return [];
    }
  }

  private persist(key: string, values: string[]): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(values));
    } catch {
      this.persistenceAvailable.set(false);
    }
  }
}
