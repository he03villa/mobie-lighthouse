import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { JournalFormComponent } from './journal-form.component';

describe('JournalFormComponent', () => {
  let component: JournalFormComponent;
  let fixture: ComponentFixture<JournalFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [JournalFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
