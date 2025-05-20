import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../services/manager.service'; 

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css'],
})
export class ManagerDashboardComponent implements OnInit, AfterViewInit {
  managers: any[] = [];
  selectedManagerId: number | null = null;
  employees: any[] = [];
  totalEmployees: number = 0;
  maleEmployeesCount: number = 0;

  @ViewChild('totalEmployeesChart') totalEmployeesChartRef!: ElementRef;
  @ViewChild('managerEmployeesChart') managerEmployeesChartRef!: ElementRef;

  private totalEmployeesChart!: Chart;
  private managerEmployeesChart!: Chart;
  private chartsInitialized = false;

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadManagers();
    this.loadTotalEmployees();
  }

  ngAfterViewInit(): void {
    this.chartsInitialized = true;
    this.tryRenderCharts();
  }

  loadManagers(): void {
    this.managerService.getManagers().subscribe({
      next: (response) => {
        this.managers = response;
      },
      error: (error) => {
        console.error('Error al obtener los managers:', error);
        alert('Ocurrió un error al consultar los managers.');
      },
    });
  }

  loadTotalEmployees(): void {
    this.managerService.getTotalEmployees().subscribe({
      next: (response) => {
        this.totalEmployees = response[0]?.total_count || 0;
        this.tryRenderCharts();
      },
      error: (error) => {
        console.error('Error al obtener el total de empleados:', error);
        alert('Ocurrió un error al consultar el total de empleados.');
      },
    });
  }

  onManagerSelected(): void {
    if (this.selectedManagerId !== null) {
      this.loadMaleEmployeesByManager(this.selectedManagerId);
      this.loadMaleEmployeesCountByManager(this.selectedManagerId);
    }
  }

  loadMaleEmployeesByManager(managerId: number): void {
    this.managerService.getMaleEmployeesByManager(managerId, 0, 10).subscribe({
      next: (response) => {
        this.employees = response;
      },
      error: (error) => {
        console.error('Error al obtener empleados masculinos:', error);
        alert('Ocurrió un error al consultar los empleados masculinos.');
      },
    });
  }

  loadMaleEmployeesCountByManager(managerId: number): void {
    this.managerService.getMaleEmployeesCountByManager(managerId).subscribe({
      next: (response) => {
        this.maleEmployeesCount = response[0]?.total_count || 0;
        this.tryRenderCharts();
      },
      error: (error) => {
        console.error('Error al obtener el conteo de empleados masculinos:', error);
        alert('Ocurrió un error al consultar el conteo de empleados masculinos.');
      },
    });
  }

  private tryRenderCharts(): void {
    if (!this.chartsInitialized) return;

    const totalChartReady = this.totalEmployeesChartRef?.nativeElement;
    const managerChartReady = this.managerEmployeesChartRef?.nativeElement;

    if (totalChartReady && managerChartReady) {
      this.renderCharts();
    }
  }

  private renderCharts(): void {
    if (this.totalEmployeesChart) {
      this.totalEmployeesChart.destroy();
    }
    if (this.managerEmployeesChart) {
      this.managerEmployeesChart.destroy();
    }

    const totalEmployeesChartElement = this.totalEmployeesChartRef.nativeElement;
    const managerEmployeesChartElement = this.managerEmployeesChartRef.nativeElement;

    // Pie Chart: Total vs empleados del manager
    this.totalEmployeesChart = new Chart(totalEmployeesChartElement, {
      type: 'pie',
      data: {
        labels: ['Total Empleados', 'Empleados del Manager'],
        datasets: [
          {
            data: [this.totalEmployees, this.maleEmployeesCount],
            backgroundColor: ['#36A2EB', '#FF6384'],
            hoverBackgroundColor: ['#36A2EB', '#FF6384'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });

    // Bar Chart: Distribución de género
    this.managerEmployeesChart = new Chart(managerEmployeesChartElement, {
      type: 'bar',
      data: {
        labels: ['Masculino', 'Femenino'],
        datasets: [
          {
            label: 'Empleados',
            data: [this.maleEmployeesCount, 0], // Puedes actualizar si agregas mujeres
            backgroundColor: ['#4BC0C0', '#FF9F40'],
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
