import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FieldNoteFormComponent } from './field-note-form.component';

describe('FieldNoteFormComponent', () => {
  let component: FieldNoteFormComponent;
  let fixture: ComponentFixture<FieldNoteFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FieldNoteFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldNoteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
