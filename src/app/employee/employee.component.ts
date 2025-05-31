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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.initChartOptions();
    this.fetchManagers();

    // DEBUG: Forzar valores para probar
    setTimeout(() => {
      this.maleEmployeesCount = 2668;
      this.totalEmployees = 50000;
      this.updateChartData();
      console.log('Valores forzados aplicados');
    }, 3000);
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

  // Actualiza el método fetchMaleEmployees() con esto:

fetchMaleEmployees(): void {
  if (!this.selectedManagerId) return;

  this.loading = true;
  
  // 1. Obtener conteo de hombres (respuesta: [{"total_count": 2668}])
  this.http.get<any[]>(`${this.API_BASE_URL}/employees/manager/${this.selectedManagerId}/males/count`)
    .subscribe({
      next: (response) => {
        // EXTRACCIÓN CORREGIDA (array con objeto)
        this.maleEmployeesCount = response[0].total_count;
        this.totalRecords = this.maleEmployeesCount;

        // 2. Obtener total general (respuesta: [{"total_employees": 300024}])
        this.http.get<any[]>(`${this.API_BASE_URL}/employees/count`)
          .subscribe({
            next: (totalResponse) => {
              // EXTRACCIÓN CORREGIDA (nota: usa total_employees, no total_count)
              this.totalEmployees = totalResponse[0].total_employees;
              
              this.updateChartData();
              this.loadPage();
              this.loading = false;
            },
            error: (err) => {
              console.error('Error total:', err);
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
      
      // Debug: verifica que lleguen los datos
      console.log('Datos paginados:', {
        page: this.currentPage,
        size: this.pageSize,
        data: data
      });
    },
    error: (err) => {
      console.error('Error al cargar página:', err);
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