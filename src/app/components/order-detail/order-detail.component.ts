import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../orders/service/orders.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService } from '../../shared/components/confirmation-modal/service/confirmation.service';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, NgbDatepickerModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  orderId!: any;
  order!: any;

  startDate!: NgbDateStruct;
  endDate!: NgbDateStruct;
  selectedDates: NgbDateStruct[] = [];
  pausedDates: NgbDateStruct[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: OrdersService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');
    this.loadDetails();
  }

  loadDetails() {
    this.service.getOrderByID(this.orderId).subscribe({
      next: (res: any) => {
        this.order = res.data || {}

        this.startDate = this.convertToStruct(this.order.start_date);
        this.endDate = this.convertToStruct(this.order.end_date);

        this.pausedDates = this.order.order_pauses.map((pause: any) => 
          this.convertToStruct(pause.pause_date)
        );
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

  // New Method to check if date is already paused
  isDateAlreadyPaused(date: NgbDateStruct): boolean {
    return this.pausedDates.some(d => 
      d.day === date.day && d.month === date.month && d.year === date.year
    );
  }

  convertToStruct(dateStr: string): NgbDateStruct {
    const date = new Date(dateStr);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  isDateInRange(date: NgbDateStruct): boolean {
    const d = new Date(date.year, date.month - 1, date.day);
    const start = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day);
    const end = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day);
    return d >= start && d <= end;
  }

  toggleDate(date: NgbDateStruct) {
    if (this.isDateAlreadyPaused(date)) {
      return;
    }

    const index = this.selectedDates.findIndex(d =>
      d.day === date.day && d.month === date.month && d.year === date.year
    );
    if (index !== -1) {
      this.selectedDates.splice(index, 1);
    } else {
      this.selectedDates.push(date);
    }
  }

  openPauseModal(content: any) {
    this.selectedDates = [];

    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  isDateSelected(date: NgbDateStruct): boolean {
    return this.selectedDates.some(d =>
      d.day === date.day && d.month === date.month && d.year === date.year
    );
  }

  toDate(struct: NgbDateStruct): Date {
    return new Date(struct.year, struct.month - 1, struct.day);
  }

  submitPause(modal: any) {
    const dates = this.selectedDates.map(d =>
      `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
    );

    this.service.customPauseOrder(this.orderId, dates).subscribe({
      next: () => {
        this.alertService.showAlert({
          message: 'Order paused successfully!',
          type: 'success',
          autoDismiss: true,
          duration: 3000
        });
        this.loadDetails();
        modal.close();
      },
      error: (err) => {
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
  }

  /**
   * Cancel Order with Confirmation
   */
  cancelOrder(): void {

    if (this.order.status === 'completed') {
    this.alertService.showAlert({
      message: 'Cannot cancel a completed order',
      type: 'warning',
      autoDismiss: true,
      duration: 3000
    });
    return;
  }

  if (this.order.status === 'cancelled') {
    this.alertService.showAlert({
      message: 'This order is already cancelled',
      type: 'warning',
      autoDismiss: true,
      duration: 3000
    });
    return;
  }

    const confirmationText = `Are you sure you want to cancel order ${this.order.order_id}? This action cannot be undone and the order will be marked as cancelled.`;

    this.confirmationService.confirm(confirmationText).then(confirmed => {
      if (confirmed) {
        this.service.cancelOrder(this.orderId).subscribe({
          next: (res: any) => {
            this.alertService.showAlert({
              message: 'Order cancelled successfully',
              type: 'success',
              autoDismiss: true,
              duration: 3000
            });
            // Reload the order details to show updated status
            this.loadDetails();
          },
          error: (err) => {
            console.error('Failed to cancel order:', err);
            this.alertService.showAlert({
              message: err.error?.message || 'Failed to cancel order',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      }
    });
  }

  getTomorrow(): NgbDateStruct {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    }
  }

  /**
   * Gets the day after the start date
   */
  getDayAfterStartDate(): NgbDateStruct {
    const startDateObj = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day);
    startDateObj.setDate(startDateObj.getDate() + 1);
    return {
      year: startDateObj.getFullYear(),
      month: startDateObj.getMonth() + 1,
      day: startDateObj.getDate()
    };
  }

 
  markDisabled = (date: NgbDateStruct, current?: { year: number; month: number }) => {
    const selectedDate = new Date(date.year, date.month - 1, date.day);
    selectedDate.setHours(0, 0, 0, 0);

    // Get today's date (current day should not be selectable)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date (minimum selectable date)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get start date
    const startDateObj = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day);
    startDateObj.setHours(0, 0, 0, 0);

    // Get end date
    const endDateObj = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day);
    endDateObj.setHours(0, 0, 0, 0);

    // To check if date is already paused
    const isDateAlreadyPaused = this.isDateAlreadyPaused(date);

    // Disable if:
    // 1. Date is before tomorrow (includes today and all past dates)
    // 2. Date is before start date
    // 3. Date is after end date
    return selectedDate < tomorrow || selectedDate < startDateObj || selectedDate > endDateObj || isDateAlreadyPaused;
  }
}