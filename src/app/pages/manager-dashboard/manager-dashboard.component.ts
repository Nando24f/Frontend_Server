import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { ManagerService } from '../../services/manager.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Chart.js v3+ auto-registers all components with 'chart.js/auto'

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit, AfterViewInit {
  managers: any[] = [];
  selectedManagerId: number | null = null;
  employees: any[] = [];
  totalEmployees: number = 0;
  maleEmployeesCount: number = 0;

  @ViewChild('totalEmployeesChart') totalEmployeesChartRef!: ElementRef;
  @ViewChild('managerEmployeesChart') managerEmployeesChartRef!: ElementRef;

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadManagers();
    this.loadTotalEmployees();
  }

  ngAfterViewInit(): void {
    // Los gráficos se renderizarán después de cargar los datos
  }

  loadManagers(): void {
    this.managerService.getManagers().subscribe((data) => {
      this.managers = data;
    });
  }

  loadTotalEmployees(): void {
    this.managerService.getTotalEmployees().subscribe((data) => {
      this.totalEmployees = data[0].total_employees;
      this.renderCharts(); // Actualizar gráficos cuando lleguen los datos
    });
  }

  onManagerSelected(): void {
    if (this.selectedManagerId) {
      this.loadMaleEmployeesByManager(this.selectedManagerId);
      this.loadMaleEmployeesCountByManager(this.selectedManagerId);
    }
  }

  loadMaleEmployeesByManager(managerId: number): void {
    this.managerService
      .getMaleEmployeesByManager(managerId, 0, 10)
      .subscribe((data) => {
        this.employees = data;
      });
  }

  loadMaleEmployeesCountByManager(managerId: number): void {
    this.managerService
      .getMaleEmployeesCountByManager(managerId)
      .subscribe((data) => {
        this.maleEmployeesCount = data[0].total_count;
        this.renderCharts(); // Actualizar gráficos cuando lleguen los datos
      });
  }

  renderCharts(): void {
    // Destruir gráficos anteriores si existen
    const totalEmployeesChartElement = this.totalEmployeesChartRef.nativeElement;
    const managerEmployeesChartElement = this.managerEmployeesChartRef.nativeElement;

    if (totalEmployeesChartElement.chart) {
      totalEmployeesChartElement.chart.destroy();
    }
    if (managerEmployeesChartElement.chart) {
      managerEmployeesChartElement.chart.destroy();
    }

    // Gráfico 1: Total de empleados vs. empleados del manager (Pie Chart)
    new Chart(totalEmployeesChartElement, {
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

    // Gráfico 2: Distribución por género (Bar Chart)
    new Chart(managerEmployeesChartElement, {
      type: 'bar',
      data: {
        labels: ['Masculino', 'Femenino'],
        datasets: [
          {
            label: 'Empleados',
            data: [this.maleEmployeesCount, 0], // Ajusta según tus datos
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