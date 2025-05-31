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
  totalEmployees: number = 0;
  loading: boolean = false;
  chartData: any;
  chartOptions: any;
  
  // Variables de paginación mejoradas
  currentPage: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;
  displayedRange: string = '';
  totalPages: number = 0;

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
  if (!this.selectedManagerId) return;

  this.loading = true;
  
  // 1. Obtener conteo de hombres
  this.http.get<{total_count: number}>(
    `${this.API_BASE_URL}/employees/manager/${this.selectedManagerId}/males/count`
  ).subscribe({
    next: (response) => {
      this.maleEmployeesCount = response.total_count;
      this.totalRecords = response.total_count;
      
      // 2. Obtener total general de empleados
      this.http.get<{total_count: number}>(
        `${this.API_BASE_URL}/employees/count`
      ).subscribe({
        next: (totalResponse) => {
          this.totalEmployees = totalResponse.total_count;
          this.updateChartData();
          this.loadPage(); // Cargar primera página de resultados
        },
        error: (err) => {
          console.error('Error total employees:', err);
          this.loading = false;
        }
      });
    },
    error: (err) => {
      console.error('Error male count:', err);
      this.loading = false;
    }
  });
}
  loadPage(): void {
    this.http.get<Employee[]>(
      `${this.API_BASE_URL}/employees/manager/${this.selectedManagerId}/males?page=${this.currentPage}&size=${this.pageSize}`
    ).subscribe({
      next: (data) => {
        this.maleEmployees = data;
        this.updateDisplayedRange();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.loading = false;
      }
    });
  }

  updateDisplayedRange(): void {
    const startItem = this.currentPage * this.pageSize + 1;
    const endItem = Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords);
    this.displayedRange = `Mostrando ${startItem}-${endItem} de ${this.totalRecords}`;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPage();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPage();
    }
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