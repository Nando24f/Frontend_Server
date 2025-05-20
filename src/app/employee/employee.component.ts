import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartType } from 'chart.js';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  managers: any[] = [];
  selectedManagerId: number | null = null;
  selectedManagerName: string = '';
  employees: any[] = [];
  employeeCount: number = 0;
  totalEmployees: number = 0;

  pieChartData = {
    labels: ['Gerente', 'Otros'],
    datasets: [{ data: [0, 0] }]
  };
  pieChartType: ChartType = 'pie';

  barChartData = {
    labels: ['Total'],
    datasets: [{ data: [0] }]
  };
  barChartType: ChartType = 'bar';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadManagers();
    this.loadTotalEmployees();
  }

  loadManagers(): void {
    this.http.get<any[]>('/api/managerss').subscribe(data => {
      this.managers = data;
    });
  }

  onManagerSelect(): void {
    if (!this.selectedManagerId) return;

    const manager = this.managers.find(m => m.emp_no === this.selectedManagerId);
    this.selectedManagerName = manager ? `${manager.first_name} ${manager.last_name}` : 'Desconocido';

    this.http.get<any[]>(`/api/employees/manager/${this.selectedManagerId}/count`).subscribe(data => {
      this.employeeCount = data[0]?.count || 0;
      this.updateCharts();
    });

    this.http.get<any[]>(`/api/employees/manager/${this.selectedManagerId}`).subscribe(data => {
      this.employees = data;
    });
  }

  loadTotalEmployees(): void {
    this.http.get<any[]>(`/api/employees/count`).subscribe(data => {
      this.totalEmployees = data[0]?.total || 0;
      this.updateCharts();
    });
  }

  updateCharts(): void {
    this.pieChartData = {
      labels: ['Gerente', 'Otros'],
      datasets: [{ data: [this.employeeCount, this.totalEmployees - this.employeeCount] }]
    };

    this.barChartData = {
      labels: ['Total'],
      datasets: [{ data: [this.totalEmployees] }]
    };
  }
}
