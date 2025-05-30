import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // <-- Agrega esto
import { ChartModule } from 'primeng/chart'; // Asegúrate de tener instalado PrimeNG y su módulo de gráficos
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  standalone: true,
  imports: [FormsModule, ChartModule,CommonModule] // Asegúrate de importar FormsModule y ChartModule
})
export class EmployeeComponent implements OnInit {
  managers: any[] = [];
  selectedManagerId: number | null = null;
  maleEmployees: any[] = [];
  maleEmployeesCount: number = 0;
  totalEmployeesCount: number = 0;
  loading: boolean = false;
  chartData: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchManagers();
    this.fetchTotalEmployees();
  }

  fetchManagers(): void {
    this.http.get<any[]>('http://200.13.4.221:8080/api/managerss').subscribe({
      next: (data) => this.managers = data,
      error: (err) => console.error('Error fetching managers:', err)
    });
  }

  fetchMaleEmployees(): void {
    if (!this.selectedManagerId) return;
    
    this.loading = true;
    
    // Fetch count
    this.http.get<any[]>(`http://200.13.4.221:8080/api/employees/manager/${this.selectedManagerId}/males/count`)
      .subscribe({
        next: (data) => {
          this.maleEmployeesCount = data[0]?.count || 0;
          this.updateChartData();
        },
        error: (err) => console.error('Error fetching male employees count:', err)
      });
    
    // Fetch list
    this.http.get<any[]>(`http://200.13.4.221:8080/api/employees/manager/${this.selectedManagerId}/males`)
      .subscribe({
        next: (data) => {
          this.maleEmployees = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching male employees:', err);
          this.loading = false;
        }
      });
  }

  fetchTotalEmployees(): void {
    this.http.get<any[]>('http://200.13.4.221:8080/api/employees/count')
      .subscribe({
        next: (data) => {
          this.totalEmployeesCount = data[0]?.count || 0;
          this.updateChartData();
        },
        error: (err) => console.error('Error fetching total employees:', err)
      });
  }

  updateChartData(): void {
    if (this.totalEmployeesCount > 0) {
      const otherEmployees = this.totalEmployeesCount - this.maleEmployeesCount;
      this.chartData = {
        labels: ['Male Employees Under Manager', 'Other Employees'],
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
    this.fetchMaleEmployees();
  }
}