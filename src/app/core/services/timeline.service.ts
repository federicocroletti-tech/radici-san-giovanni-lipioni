import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { TimelineEvent } from '../models/timeline-event.model';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private readonly http = inject(HttpClient);
  private readonly events$ = this.http
    .get<TimelineEvent[]>('assets/data/timeline.json')
    .pipe(shareReplay(1));

  getEvents(): Observable<TimelineEvent[]> {
    return this.events$;
  }
}
