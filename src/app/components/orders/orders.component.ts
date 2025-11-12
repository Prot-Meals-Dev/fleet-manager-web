import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrdersService } from './service/orders.service';
import { NgbCalendar, NgbDate, NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { DeliveryPartnerService } from '../delivery-partner/service/delivery-partner.service';
import { Router } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ConfirmationService } from '../../shared/components/confirmation-modal/service/confirmation.service';


@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule, PaginationModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  filters = {
    deliveryPartnerId: '',
    date: '',
    status: '',
    limit: 10,
    page: 1
  };
  orderForm!: FormGroup;
  orderList!: any[]
  deliveryPartners!: any[];
  mealTypes!: any[];
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  payableAmount: number = 0;
  minDate: NgbDateStruct;
  today: NgbDateStruct;
  isLoading = false;
  selectedOrder: any = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private service: OrdersService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private alertService: AlertService,
    private partnerService: DeliveryPartnerService,
    private calendar: NgbCalendar,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.today = this.calendar.getToday();
    this.minDate = this.today;
  }

  ngOnInit(): void {
    this.loadOrderList()
    this.initForm();

    this.loadDeliveryPartners()
    this.loadMealTypes()
  }

  initForm() {
    this.orderForm = this.fb.group({
      customerName: [''],
      customerAddress: [''],
      deliveryAddress: [''],
      locationUrl: [''],
      contactNumber: [''],
      email: [''],
      mealTypeId: [''],
      startDate: [null],
      endDate: [null],
      recurringDays: [[]],
      deliveryPartner: [''],
      mealPreferences: this.fb.group({
        breakfast: [false],
        lunch: [false],
        dinner: [false]
      }),
      remarks: ['']
    });

    this.orderForm.get('mealTypeId')?.valueChanges.subscribe(() => this.calculatePayableAmount());
    this.orderForm.get('startDate')?.valueChanges.subscribe(() => this.calculatePayableAmount());
    this.orderForm.get('endDate')?.valueChanges.subscribe(() => this.calculatePayableAmount());
  }

  loadOrderList(bool?: boolean) {
    this.isLoading = true;
    this.filters.limit = this.itemsPerPage;
    this.filters.page = this.currentPage;

    if (bool) {
      this.filters.limit = 10;
      this.filters.page = 1;
    }

    this.service.getOrdersList(this.filters).subscribe({
      next: (res: any) => {
        this.orderList = res.data.data || [];
        this.totalItems = res.data.total || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
        this.isLoading = false;
      }
    })
  }

  onPageChange(event: { page: number; itemsPerPage: number }) {
    if (this.currentPage !== event.page) {
      this.currentPage = event.page;
      this.itemsPerPage = event.itemsPerPage;
      this.loadOrderList();
    }
  }

  toggleFoodOption(option: string) {
    if (this.selectedOrder) return;

    const mealPreferences = this.orderForm.get('mealPreferences');
    if (mealPreferences) {
      const current = mealPreferences.get(option.toLowerCase());
      if (current) {
        current.setValue(!current.value);
        this.calculatePayableAmount();
      }
    }
  }

  calculatePayableAmount() {
    const value = this.orderForm.getRawValue();
    const mealType = this.mealTypes.find(type => type.id === value.mealTypeId);
    const preferences = value.mealPreferences;

    if (!mealType || !value.startDate || !value.endDate) {
      this.payableAmount = 0;
      return;
    }

    const start = new Date(value.startDate.year, value.startDate.month - 1, value.startDate.day);
    const end = new Date(value.endDate.year, value.endDate.month - 1, value.endDate.day);

    if (end < start) {
      this.payableAmount = 0;
      return;
    }

    const totalDays = this.getTotalApplicableDays(start, end, value.recurringDays);

    let total = 0;
    if (preferences.breakfast) total += parseFloat(mealType.breakfast_price) * totalDays;
    if (preferences.lunch) total += parseFloat(mealType.lunch_price) * totalDays;
    if (preferences.dinner) total += parseFloat(mealType.dinner_price) * totalDays;

    this.payableAmount = total;
  }

  getTotalApplicableDays(start: Date, end: Date, recurringDays: string[]): number {
    const dayMap: { [key: number]: string } = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat'
    };

    let count = 0;
    const normalizedRecurring = recurringDays.map(day => day.toLowerCase());

    const current = new Date(start);
    while (current <= end) {
      const dayStr = dayMap[current.getDay()];
      if (normalizedRecurring.includes(dayStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  copyCustomerToDelivery(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.orderForm.patchValue({
        deliveryAddress: this.orderForm.value.customerAddress
      });
    }
  }

  toggleRecurringDay(day: string) {
    const current = this.orderForm.value.recurringDays;
    if (current.includes(day)) {
      this.orderForm.patchValue({
        recurringDays: current.filter((d: string) => d !== day)
      });
    } else {
      this.orderForm.patchValue({
        recurringDays: [...current, day]
      });
    }
    this.calculatePayableAmount();
  }

  isDateDisabled = (date: NgbDate, current?: { year: number; month: number }): boolean => {
    const todayDate = new Date(this.today.year, this.today.month - 1, this.today.day);
    const checkDate = new Date(date.year, date.month - 1, date.day);
    return checkDate <= todayDate; // disables today and earlier
  };


  submitOrder() {
    if (this.orderForm.valid) {
      const value = this.orderForm.value;

      const payload = {
        name: value.customerName,
        address: value.customerAddress,
        delivery_address: value.deliveryAddress,
        location_url: value.locationUrl,
        phone: value.contactNumber,
        email: value.email,
        meal_type_id: value.mealTypeId,
        start_date: this.formatDate(value.startDate),
        end_date: this.formatDate(value.endDate),
        recurring_days: value.recurringDays.map((d: string) => d.toLowerCase()),
        delivery_partner_id: value.deliveryPartner,
        meal_preferences: {
          breakfast: value.mealPreferences.breakfast,
          lunch: value.mealPreferences.lunch,
          dinner: value.mealPreferences.dinner
        },
        remarks: value.remarks
      };
  

      this.service.createNewOrder(payload).subscribe({
        next: (res) => {
          this.alertService.showAlert({
            message: 'Order Created',
            type: 'success',
            autoDismiss: true,
            duration: 4000
          });
          this.loadOrderList();
          this.orderForm.reset();
          this.modalService.dismissAll();
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

  onSubmitOrder() {
    if (this.selectedOrder) {
      this.updateOrder();
    } else {
      this.submitOrder();
    }
  }

  openModal(content: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.selectedOrder = null;
    this.initForm();

    this.modalService.open(content, { size: 'lg' });
  }

editOrder(order: any, content: any) {
  this.selectedOrder = order;

  const formattedRecurringDays = (order.recurring_days || []).map((day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  });

  this.orderForm.patchValue({
    customerName: order.name,
    email: order.email,
    customerAddress: order.address,
    deliveryAddress: order.delivery_address,
    locationUrl: order.location_url, // ADD THIS LINE
    contactNumber: order.phone,
    mealTypeId: order.meal_type_id,
    startDate: this.parseDate(order.start_date),
    endDate: this.parseDate(order.end_date),
    deliveryPartner: order.delivery_assignments[0].delivery_partner_id,
    recurringDays: formattedRecurringDays || [],
    mealPreferences: {
      breakfast: order.meal_preferences?.breakfast || false,
      lunch: order.meal_preferences?.lunch || false,
      dinner: order.meal_preferences?.dinner || false
    },
    remarks: order.remarks
  });

  this.orderForm.get('customerName')?.disable();
  this.orderForm.get('email')?.disable();
  this.orderForm.get('mealTypeId')?.disable();
  this.orderForm.get('startDate')?.disable();
  this.orderForm.get('endDate')?.disable();
  this.orderForm.get('mealPreferences')?.disable();
  this.orderForm.get('recurringDays')?.disable();

  this.calculatePayableAmount();

  this.modalService.open(content, { size: 'lg' });
}

  parseDate(dateStr: string): NgbDateStruct {
    const date = new Date(dateStr);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  updateOrder() {
    if (this.orderForm.valid && this.selectedOrder) {
      const value = this.orderForm.getRawValue();
      const payload = {
        address: value.customerAddress,
        delivery_address: value.deliveryAddress,
        location_url: value.locationUrl,
        phone: value.contactNumber,
        delivery_partner_id: value.deliveryPartner,
        remarks: value.remarks
      };

      this.service.updateOrder(payload, this.selectedOrder.id).subscribe({
        next: () => {
          this.alertService.showAlert({
            message: 'Order Updated',
            type: 'success',
            autoDismiss: true,
            duration: 4000
          });
          this.loadOrderList();
          this.modalService.dismissAll();
          this.selectedOrder = null;
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

  loadMealTypes() {
    this.service.getMealTypes().subscribe({
      next: (res: any) => {
        this.mealTypes = res.data || []
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  loadDeliveryPartners() {
    this.partnerService.getPartnerList().subscribe({
      next: (res: any) => {
        this.deliveryPartners = res.data || []
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  resetFilters() {
    this.filters = {
      deliveryPartnerId: '',
      date: '',
      status: '',
      limit: this.itemsPerPage,
      page: 1
    };
    this.currentPage = 1;
    this.loadOrderList();
  }

  formatDate(dateStruct: NgbDateStruct | null): string {
    if (!dateStruct) return '';
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${dateStruct.year}-${pad(dateStruct.month)}-${pad(dateStruct.day)}`;
  }

  goToOrderDetail(orderId: string) {
    this.router.navigate(['/orderdetail', orderId]);
  }

  toggleOrderStatus(order: any): void {
    const isCurrentlyActive = order.status === 'active';
    const newStatus = isCurrentlyActive ? 'paused' : 'active';
    const confirmationText = `Are you sure you want to ${isCurrentlyActive ? 'pause' : 'resume'} this order?`;

    this.confirmationService.confirm(confirmationText).then(confirmed => {
      if (confirmed) {
        this.service.pauseOrder(order.id, newStatus).subscribe({
          next: () => {
            order.status = newStatus;
            this.alertService.showAlert({
              message: 'Order Paused',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadOrderList();
          },
          error: err => {
            console.error('Failed to update order status:', err);
            this.alertService.showAlert({
              message: err.error.message,
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      }
    });
  }

  deleteOrder(order: any): void {
    const confirmationText = `Are you sure you want to delete order ${order.order_id}? This action cannot be undone.`;

    this.confirmationService.confirm(confirmationText).then(confirmed => {
      if(confirmed) {
        this.service.deleteOrder(order.id).subscribe({
          next: () => {
            this.alertService.showAlert({
              message: `Order deleted successfully`,
              type: 'success',
              autoDismiss: true,
              duration: 3000
            });
            this.loadOrderList();
          },
          error: (err) => {
            this.alertService.showAlert({
              message: err.error.message || `Failed to delete order`,
              type: `error`,
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      }
    });
  }
}
