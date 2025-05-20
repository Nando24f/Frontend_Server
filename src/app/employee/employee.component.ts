import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Employee {
  emp_no: number;
  first_name: string;
  last_name: string;
  gender: string;
  hire_date: string;
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee.component.html'
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  totalMalesByManager: number = 0;
  totalEmployees: number = 0;

  managerId = 110022;
  page = 0;
  size = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadCountByManager();
    this.loadTotalEmployees();
  }

  loadEmployees(): void {
    const params = new HttpParams()
      .set('page', this.page)
      .set('size', this.size);

    this.http.get<Employee[]>(`/api/employees/manager/${this.managerId}/males`, { params })
      .subscribe(data => this.employees = data);
  }

  loadCountByManager(): void {
    this.http.get<{ total_count: number }>(`/api/employees/manager/${this.managerId}/males/count`)
      .subscribe(data => this.totalMalesByManager = data.total_count);
  }

  loadTotalEmployees(): void {
    this.http.get<{ total_employees: number }>(`/api/employees/count`)
      .subscribe(data => this.totalEmployees = data.total_employees);
  }

  nextPage(): void {
    this.page++;
    this.loadEmployees();
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadEmployees();
    }
  }
}
