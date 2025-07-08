import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { DeliveryPartnerService } from '../delivery-partner/service/delivery-partner.service';

@Component({
  selector: 'app-delivery-partner-detail',
  imports: [],
  templateUrl: './delivery-partner-detail.component.html',
  styleUrl: './delivery-partner-detail.component.css'
})
export class DeliveryPartnerDetailComponent implements OnInit {
  partnerId: string | null = null;
  partner!: any;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private service: DeliveryPartnerService
  ) { }

  ngOnInit(): void {
    this.partnerId = this.route.snapshot.paramMap.get('id');

    this.service.getPartner(this.partnerId).subscribe({
      next: (res: any) => {
        this.partner = res.data || {}
      },
      error: (err) => {
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })

    this.loadPartnerDeliveries(this.partnerId)
  }

  loadPartnerDeliveries(id: string | null) {
    this.service.loadDeliveries(id).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}
