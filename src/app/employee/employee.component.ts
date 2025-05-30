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
  totalEmployees: number = 0; // Cambiado de totalEmployeesUnderManager a totalEmployees
  loading: boolean = false;
  chartData: any;
  chartOptions: any;

  private readonly API_BASE_URL = 'http://200.13.4.251:4200/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initChartOptions();
    this.fetchManagers();
  }

  initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  fetchManagers(): void {
    this.http.get<Manager[]>(`${this.API_BASE_URL}/managerss`).subscribe({
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
    this.maleEmployees = [];
    this.chartData = null;
    
    // 1. Obtener lista de empleados masculinos
    this.http.get<Employee[]>(
      `${this.API_BASE_URL}/employees/manager/${this.selectedManagerId}/males`
    ).subscribe({
      next: (data) => {
        this.maleEmployees = data;
        this.maleEmployeesCount = data.length;
        
        // 2. Obtener TOTAL de empleados en la empresa
        this.http.get<{count: number}[]>(
          `${this.API_BASE_URL}/employees/count`
        ).subscribe({
          next: (totalData) => {
            this.totalEmployees = totalData[0]?.count || 0;
            this.updateChartData();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching total employees:', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching male employees:', err);
        this.loading = false;
      }
    });
  }

  updateChartData(): void {
    if (this.totalEmployees > 0 && this.maleEmployeesCount > 0) {
      const otherEmployees = this.totalEmployees - this.maleEmployeesCount;
      
      this.chartData = {
        labels: ['Hombres bajo manager', 'Total otros empleados'],
        datasets: [
          {
            data: [this.maleEmployeesCount, otherEmployees],
            backgroundColor: ['#42A5F5', '#FFA726'],
            hoverBackgroundColor: ['#64B5F6', '#FFB74D'],
            borderWidth: 1
          }
        ]
      };
    } else {
      this.chartData = null;
      console.warn('Datos insuficientes para el gráfico', {
        total: this.totalEmployees,
        males: this.maleEmployeesCount
      });
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