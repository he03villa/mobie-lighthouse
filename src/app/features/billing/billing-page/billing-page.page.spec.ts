import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingPagePage } from './billing-page.page';

describe('BillingPagePage', () => {
  let component: BillingPagePage;
  let fixture: ComponentFixture<BillingPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
