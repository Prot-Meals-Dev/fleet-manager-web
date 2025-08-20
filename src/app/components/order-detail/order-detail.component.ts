import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../orders/service/orders.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

  constructor(
    private route: ActivatedRoute,
    private service: OrdersService,
    private alertService: AlertService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id');

    this.service.getOrderByID(this.orderId).subscribe({
      next: (res: any) => {
        this.order = res.data || {}

        this.startDate = this.convertToStruct(this.order.start_date);
        this.endDate = this.convertToStruct(this.order.end_date);
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

  loadDetails(){    this.service.getOrderByID(this.orderId).subscribe({
      next: (res: any) => {
        this.order = res.data || {}

        this.startDate = this.convertToStruct(this.order.start_date);
        this.endDate = this.convertToStruct(this.order.end_date);
      },
      error: (err) => {
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    })}

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
        this.loadDetails()
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

}
