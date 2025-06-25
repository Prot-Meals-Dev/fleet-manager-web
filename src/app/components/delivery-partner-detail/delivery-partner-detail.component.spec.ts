import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryPartnerDetailComponent } from './delivery-partner-detail.component';

describe('DeliveryPartnerDetailComponent', () => {
  let component: DeliveryPartnerDetailComponent;
  let fixture: ComponentFixture<DeliveryPartnerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryPartnerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryPartnerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
