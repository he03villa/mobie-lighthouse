import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalListPage } from './journal-list.page';

describe('JournalListPage', () => {
  let component: JournalListPage;
  let fixture: ComponentFixture<JournalListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
