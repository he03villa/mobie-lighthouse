import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgramListPage } from './program-list.page';

describe('ProgramListPage', () => {
  let component: ProgramListPage;
  let fixture: ComponentFixture<ProgramListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
