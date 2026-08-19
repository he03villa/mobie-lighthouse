import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipantListPage } from './participant-list.page';

describe('ParticipantListPage', () => {
  let component: ParticipantListPage;
  let fixture: ComponentFixture<ParticipantListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
