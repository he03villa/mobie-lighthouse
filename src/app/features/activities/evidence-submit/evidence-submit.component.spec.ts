import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EvidenceSubmitComponent } from './evidence-submit.component';

describe('EvidenceSubmitComponent', () => {
  let component: EvidenceSubmitComponent;
  let fixture: ComponentFixture<EvidenceSubmitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EvidenceSubmitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EvidenceSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
