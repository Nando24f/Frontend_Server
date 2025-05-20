import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
})
export class EmployeeComponent implements OnInit {
  managers: any[] = [];
  selectedManagerId: string = '';
  employees: any[] = []; 

  managerSelected: boolean = false;
  totalEmployees: number = 0;
  totalMalesByManager: number = 0; // Cambié el nombre para que coincida con el HTML

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

  loadTotalEmployees(): void {
    this.http.get<any[]>(`/api/employees/count`).subscribe(data => {
      this.totalEmployees = data[0]?.total || 0;
    });
  }

  onManagerSelect(): void {
    if (!this.selectedManagerId) return;

    // Obtener empleados supervisados por el gerente
    this.http.get<any[]>(`/api/employees/manager/${this.selectedManagerId}`).subscribe(data => {
      this.employees = data;
      this.managerSelected = true;
      this.totalMalesByManager = data.length;
      const manager = this.managers.find(m => m.emp_no === this.selectedManagerId);
    this.selectedManagerId = manager ? `${manager.manager_name}` : '';

    });
  }
}
