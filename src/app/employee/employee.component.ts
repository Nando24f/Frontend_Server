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

  fetchMaleEmployees(): void {
    if (!this.selectedManagerId) return;

    this.loading = true;
    
    // 1. Obtener conteo de hombres
    this.http.get<any[]>(`${this.API_BASE_URL}/employees/manager/${this.selectedManagerId}/males/count`)
      .subscribe({
        next: (response) => {
          this.maleEmployeesCount = response[0].total_count;

          // 2. Obtener total general
          this.http.get<any[]>(`${this.API_BASE_URL}/employees/count`)
            .subscribe({
              next: (totalResponse) => {
                this.totalEmployees = totalResponse[0].total_employees;
                
                // 3. Obtener TODOS los empleados (usando un tamaño mayor que el total)
                const size = this.maleEmployeesCount + 100;
                this.http.get<Employee[]>(
                  `${this.API_BASE_URL}/employees/manager/${this.selectedManagerId}/males?size=${size}`
                ).subscribe({
                  next: (data) => {
                    this.maleEmployees = data;
                    this.updateChartData();
                    this.loading = false;
                  },
                  error: (err) => {
                    console.error('Error al cargar empleados:', err);
                    this.loading = false;
                  }
                });
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
updateChartData(): void {
  if (this.totalEmployees > 0 && this.maleEmployeesCount > 0) {
    const otherEmployees = this.totalEmployees - this.maleEmployeesCount;
    const total = this.maleEmployeesCount + otherEmployees;

    this.chartData = {
      labels: ['Hombres', 'Otros'],
      datasets: [{
        data: [this.maleEmployeesCount, otherEmployees],
        backgroundColor: ['#4285F4', '#34A853'], // Colores de Google (azul/verde)
        borderWidth: 0 // Sin borde para más limpieza
      }]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom', // Leyenda abajo para ahorrar espacio
          labels: {
            boxWidth: 12,
            padding: 8,
            font: {
              size: 12
            },
            generateLabels: (chart: any) => {
              const data = chart.data;
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const percentage = Math.round((value / total) * 100);
                return {
                  text: `${label} (${percentage}%)`, // Texto compacto
                  fillStyle: data.datasets[0].backgroundColor[i],
                  fontColor: '#444',
                  lineWidth: 0
                };
              });
            }
          }
        },
        tooltip: {
          enabled: true,
          bodyFont: { size: 12 },
          callbacks: {
            label: (context: any) => {
              return ` ${context.raw.toLocaleString()} empleados`;
            }
          }
        }
      },
      maintainAspectRatio: false, // Permite controlar el tamaño libremente
      cutout: '65%', // Donut delgado
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