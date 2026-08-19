import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipantDetailPage } from './participant-detail.page';

describe('ParticipantDetailPage', () => {
  let component: ParticipantDetailPage;
  let fixture: ComponentFixture<ParticipantDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
