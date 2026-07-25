import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((component) => component.HomePage),
  },
  {
    path: 'esplora',
    loadComponent: () =>
      import('./pages/explore/explore.page').then((component) => component.ExplorePage),
  },
  {
    path: 'itinerari',
    loadComponent: () =>
      import('./pages/itineraries/itineraries.page').then((component) => component.ItinerariesPage),
  },
  {
    path: 'racconti',
    loadComponent: () =>
      import('./pages/stories/stories.page').then((component) => component.StoriesPage),
  },
  {
    path: 'privacy-cookie',
    loadComponent: () =>
      import('./pages/privacy-cookie/privacy-cookie.page').then(
        (component) => component.PrivacyCookiePage,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.page').then((component) => component.NotFoundPage),
  },
];
