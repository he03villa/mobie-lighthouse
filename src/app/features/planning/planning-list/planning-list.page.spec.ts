import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanningListPage } from './planning-list.page';

describe('PlanningListPage', () => {
  let component: PlanningListPage;
  let fixture: ComponentFixture<PlanningListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
