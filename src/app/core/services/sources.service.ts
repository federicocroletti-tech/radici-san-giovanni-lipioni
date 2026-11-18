import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Source } from '../models/source.model';

@Injectable({ providedIn: 'root' })
export class SourcesService {
  private readonly http = inject(HttpClient);
  private readonly sources$ = this.http
    .get<Source[]>('assets/data/sources.json')
    .pipe(shareReplay(1));

  getSources(): Observable<Source[]> {
    return this.sources$;
  }
}
