import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../orders/service/orders.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  orderId: string | null = null;
  order!: any;

  constructor(
    private route: ActivatedRoute,
    private service: OrdersService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');

    this.service.getOrderByID(this.orderId).subscribe({
      next: (res: any) => {
        this.order = res.data || {}
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
  }

}
