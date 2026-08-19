import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgramDetailPage } from './program-detail.page';

describe('ProgramDetailPage', () => {
  let component: ProgramDetailPage;
  let fixture: ComponentFixture<ProgramDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
