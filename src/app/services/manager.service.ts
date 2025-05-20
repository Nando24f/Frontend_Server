  // manager.service.ts
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root',
  })
  export class ManagerService {
    private apiUrl = 'api'; 

    constructor(private http: HttpClient) {}

    // Obtener lista de managers (Query 4.1)
    getManagers(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/managers`);
    }

    // Obtener empleados masculinos bajo un manager (Query 5.1)
    getMaleEmployeesByManager(managerId: number, page: number, size: number): Observable<any[]> {
      return this.http.get<any[]>(
        `${this.apiUrl}/employees/manager/${managerId}/males?page=${page}&size=${size}`
      );
    }

    // Obtener conteo de empleados masculinos bajo un manager (Query 5.2)
    getMaleEmployeesCountByManager(managerId: number): Observable<any> {
      return this.http.get<any>(
        `${this.apiUrl}/employees/manager/${managerId}/males/count`
      );
    }

    // Obtener total de empleados en la base de datos (Query 5.3)
    getTotalEmployees(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/employees/count`);
    }
  }