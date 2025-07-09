import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { DeliveryPartnerService } from '../delivery-partner/service/delivery-partner.service';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-delivery-partner-detail',
  imports: [CommonModule, DragDropModule],
  templateUrl: './delivery-partner-detail.component.html',
  styleUrl: './delivery-partner-detail.component.css'
})
export class DeliveryPartnerDetailComponent implements OnInit {
  partnerId: string | null = null;
  partner!: any;
  isEditMode = false;

  allDeliveries: any[] = [];

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
      next: (res: any) => {
        this.allDeliveries = res.data || []
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.allDeliveries, event.previousIndex, event.currentIndex);
  }

  saveReorderedDeliveries() {
    if (!this.partnerId) return;

    const payload = {
      orders: this.allDeliveries.map((delivery, index) => ({
        order_id: delivery.order_id,
        new_sequence: index + 1
      }))
    };

    this.service.updateDeliverySequence(payload, this.partnerId).subscribe({
      next: () => {
        this.alertService.showAlert({
          message: 'Delivery sequence saved successfully.',
          type: 'success',
          autoDismiss: true,
          duration: 3000
        });
        this.isEditMode = false;
        this.loadPartnerDeliveries(this.partnerId);
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert({
          message: err.error?.message || 'Failed to save delivery sequence.',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }
}
