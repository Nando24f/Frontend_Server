import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { EmployeeComponent } from './employee.component';
import { ChartModule } from 'primeng/chart';

describe('EmployeeComponent', () => {
  let component: EmployeeComponent;
  let fixture: ComponentFixture<EmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ChartModule],
      declarations: [EmployeeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty data', () => {
    expect(component.managers.length).toBe(0);
    expect(component.maleEmployees.length).toBe(0);
    expect(component.maleEmployeesCount).toBe(0);
    expect(component.totalEmployeesCount).toBe(0);
    expect(component.selectedManagerId).toBeNull();
  });

  it('should not fetch male employees when no manager is selected', () => {
    spyOn(component, 'fetchMaleEmployees');
    component.onSearch();
    expect(component.fetchMaleEmployees).not.toHaveBeenCalled();
  });
});