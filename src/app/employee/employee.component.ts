import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

interface Manager {
  emp_no: number;
  manager_name: string;
  department: string;
}

interface Employee {
  emp_no: number;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  hire_date: string;
}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  standalone: true,
  imports: [FormsModule, ChartModule, CommonModule]
})
export class EmployeeComponent implements OnInit {
  managers: Manager[] = [];
  selectedManagerId: number | null = null;
  maleEmployees: Employee[] = [];
  maleEmployeesCount: number = 0;
  totalEmployeesUnderManager: number = 0; // Nuevo: total bajo el manager
  loading: boolean = false;
  chartData: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchManagers();
  }

  fetchManagers(): void {
    this.http.get<Manager[]>('/api/managerss').subscribe({
      next: (data) => {
        this.managers = data;
        if (data.length > 0) {
          this.selectedManagerId = data[0].emp_no;
        }
      },
      error: (err) => console.error('Error fetching managers:', err)
    });
  }

  fetchMaleEmployees(): void {
    if (!this.selectedManagerId) {
      console.warn('No manager selected');
      return;
    }
    
    this.loading = true;
    
    // 1. Obtener conteo de hombres bajo el manager
    this.http.get<{count: number}[]>(`/api/employees/manager/${this.selectedManagerId}/males/count`)
      .subscribe({
        next: (maleData) => {
          this.maleEmployeesCount = maleData[0]?.count || 0;
          
          // 2. Obtener TOTAL de empleados bajo este manager
          this.http.get<{count: number}[]>(`/api/employees/count`)
            .subscribe({
              next: (totalData) => {
                this.totalEmployeesUnderManager = totalData[0]?.count || 0;
                this.updateChartData();
              },
              error: (err) => console.error('Error fetching total under manager:', err)
            });
        },
        error: (err) => console.error('Error fetching male count:', err)
      });
    
    // 3. Obtener lista de empleados masculinos
    this.http.get<Employee[]>(`/api/employees/manager/${this.selectedManagerId}/males`)
      .subscribe({
        next: (data) => {
          this.maleEmployees = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.loading = false;
        }
      });
  }

  updateChartData(): void {
    if (this.totalEmployeesUnderManager > 0) {
      const otherEmployees = this.totalEmployeesUnderManager - this.maleEmployeesCount;
      this.chartData = {
        labels: ['Hombres', 'Otros (mismo manager)'],
        datasets: [
          {
            data: [this.maleEmployeesCount, otherEmployees],
            backgroundColor: ['#42A5F5', '#FFA726'],
            hoverBackgroundColor: ['#64B5F6', '#FFB74D']
          }
        ]
      };
    }
  }

  onSearch(): void {
    if (!this.selectedManagerId) {
      alert('Por favor selecciona un manager');
      return;
    }
    this.fetchMaleEmployees();
  }
}