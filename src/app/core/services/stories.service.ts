import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Story } from '../models/story.model';

@Injectable({ providedIn: 'root' })
export class StoriesService {
  private readonly http = inject(HttpClient);
  private readonly stories$ = this.http
    .get<Story[]>('assets/data/stories.json')
    .pipe(shareReplay(1));

  getStories(): Observable<Story[]> {
    return this.stories$;
  }
}
