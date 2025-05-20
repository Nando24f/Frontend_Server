import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  managers: any[] = [];
  selectedManagerId: number | null = null;
  employees: any[] = [];
  totalMalesByManager: number = 0;
  totalEmployees: number = 0;
  managerSelected: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadManagers(); // <-- se usa la nueva query 54
  }

  // Usa la nueva query /api/managerss
  loadManagers() {
    this.http.get<any[]>('/api/managerss').subscribe({
      next: (data) => {
        this.managers = data;
      },
      error: (err) => {
        console.error('Error al cargar gerentes:', err);
      }
    });
  }

  onManagerSelect() {
    if (this.selectedManagerId !== null) {
      this.managerSelected = true;
      this.loadEmployees();
      this.loadCountByManager();
      this.loadTotalEmployees();
    }
  }

  loadEmployees() {
    this.http.get<any[]>(`/api/employees/manager/${this.selectedManagerId}/males?page=0&size=10`)
      .subscribe({
        next: (data) => {
          this.employees = data;
        },
        error: (err) => console.error('Error al cargar empleados:', err)
      });
  }

  loadCountByManager() {
    this.http.get<any[]>(`/api/employees/manager/${this.selectedManagerId}/males/count`)
      .subscribe({
        next: (data) => {
          this.totalMalesByManager = data[0]?.total_count || 0;
        },
        error: (err) => console.error('Error al contar empleados:', err)
      });
  }

  loadTotalEmployees() {
    this.http.get<any[]>(`/api/employees/count`)
      .subscribe({
        next: (data) => {
          this.totalEmployees = data[0]?.total_employees || 0;
        },
        error: (err) => console.error('Error al contar total empleados:', err)
      });
  }
}
