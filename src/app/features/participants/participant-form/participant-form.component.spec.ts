import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ParticipantFormComponent } from './participant-form.component';

describe('ParticipantFormComponent', () => {
  let component: ParticipantFormComponent;
  let fixture: ComponentFixture<ParticipantFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ParticipantFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
