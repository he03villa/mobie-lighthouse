import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanningBoardPage } from './planning-board.page';

describe('PlanningBoardPage', () => {
  let component: PlanningBoardPage;
  let fixture: ComponentFixture<PlanningBoardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningBoardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
