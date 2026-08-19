import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldNoteListPage } from './field-note-list.page';

describe('FieldNoteListPage', () => {
  let component: FieldNoteListPage;
  let fixture: ComponentFixture<FieldNoteListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldNoteListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
