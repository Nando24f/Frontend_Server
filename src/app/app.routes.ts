import { Routes } from '@angular/router';
import { ManagerDashboardComponent } from '../app/pages/manager-dashboard/manager-dashboard.component';
import { EmployeeComponent } from './employee/employee.component';

export const routes: Routes = [
  { path: '', component: EmployeeComponent }, 

  // Otras rutas...
];