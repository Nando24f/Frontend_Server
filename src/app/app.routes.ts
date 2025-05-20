import { Routes } from '@angular/router';
import { ManagerDashboardComponent } from '../app/pages/manager-dashboard/manager-dashboard.component';

export const routes: Routes = [
  { path: '', component: ManagerDashboardComponent }, // Ruta vacía
  { path: 'dashboard', component: ManagerDashboardComponent }

  // Otras rutas...
];