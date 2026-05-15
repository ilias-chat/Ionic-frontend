import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'welcome',
    loadComponent: () => import('./features/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'discovery',
        loadComponent: () => import('./features/discovery/discovery.page').then((m) => m.DiscoveryPage),
      },
      {
        path: 'map',
        loadComponent: () => import('./features/map/map.page').then((m) => m.MapPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage),
        canActivate: [adminGuard],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'discovery',
      },
    ],
  },
  {
    path: 'player/:id',
    loadComponent: () =>
      import('./features/player-detail/player-detail.page').then((m) => m.PlayerDetailPage),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome',
  },
];
