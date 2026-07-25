import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Place, PlaceCategory } from '../models/place.model';

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);
  private readonly places$ = this.http.get<Place[]>('assets/data/places.json').pipe(shareReplay(1));
  private readonly categories$ = this.http
    .get<PlaceCategory[]>('assets/data/categories.json')
    .pipe(shareReplay(1));

  getPlaces(): Observable<Place[]> {
    return this.places$;
  }

  getCategories(): Observable<PlaceCategory[]> {
    return this.categories$;
  }
}
