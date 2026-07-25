import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Itinerary } from '../models/itinerary.model';

@Injectable({ providedIn: 'root' })
export class ItinerariesService {
  private readonly http = inject(HttpClient);
  private readonly itineraries$ = this.http
    .get<Itinerary[]>('assets/data/itineraries.json')
    .pipe(shareReplay(1));

  getItineraries(): Observable<Itinerary[]> {
    return this.itineraries$;
  }
}
