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
  isRenewalMode: boolean = false;
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

    const params: any = { ...this.filters };

    const filteringCompleted = params.status === 'completed';
    if (!params.status || params.status === 'completed') {
      delete params.status;
    }

    this.service.getOrdersList(params).subscribe({
      next: (res: any) => {
        let orders = (res.data.data || []).map((order: any) => ({
          ...order,
          computedStatus: this.getOrderStatus(order)
        }));

        if (filteringCompleted) {
          orders = orders.filter((order: any) => order.computedStatus === 'completed');
          this.totalItems = orders.length;
        } else {
          this.totalItems = res.data.total || 0;
        }

        this.orderList = orders;
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

  getOrderStatus(order: any): string {
    const endDate = new Date(order.end_date);
    endDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (endDate <= today) {
      return 'completed';
    }
    return order.status;
  }

  onPageChange(event: { page: number; itemsPerPage: number }) {
    if (this.currentPage !== event.page) {
      this.currentPage = event.page;
      this.itemsPerPage = event.itemsPerPage;
      this.loadOrderList();
    }
  }

  toggleFoodOption(option: string) {
    if (this.selectedOrder && !this.isRenewalMode) return;

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

isDateDisabled = (date: NgbDate): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const check = new Date(date.year, date.month - 1, date.day);
  check.setHours(0, 0, 0, 0);

  // NORMAL CREATE ORDER → same as before (today disabled)
  if (!this.isRenewalMode) {
    return check <= today;
  }

  // RENEWAL MODE ONLY:
  // Today is allowed, yesterday is not
  return check < today;
};


renewOrder(order: any, content: any) {
  // Prevent renewing already renewed orders
  // Check the actual status from backend
  if (order.status === 'renewed' || order.computedStatus === 'renewed') {
    this.alertService.showAlert({
      message: 'This order has already been renewed',
      type: 'warning',
      autoDismiss: true,
      duration: 4000
    });
    return;
  }

  this.selectedOrder = order;
  this.isRenewalMode = true;

  console.log('Original order data for renewal:', order);

  const formattedRecurringDays = (order.recurring_days || []).map((day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  });

  const deliveryPartnerId = order.delivery_assignments?.length > 0 
    ? order.delivery_assignments[0].delivery_partner_id 
    : '';

  this.orderForm.patchValue({
    customerName: order.name,
    email: order.email,
    customerAddress: order.address,
    deliveryAddress: order.delivery_address,
    locationUrl: order.location_url,
    contactNumber: order.phone,
    mealTypeId: order.meal_type_id,
    startDate: null, 
    endDate: null,   
    deliveryPartner: deliveryPartnerId,
    recurringDays: formattedRecurringDays || [],
    mealPreferences: {
      breakfast: order.meal_preferences?.breakfast || false,
      lunch: order.meal_preferences?.lunch || false,
      dinner: order.meal_preferences?.dinner || false
    },
    remarks: order.remarks || ''
  });


  this.orderForm.get('customerName')?.enable();
  this.orderForm.get('email')?.enable();
  this.orderForm.get('mealTypeId')?.enable();
  this.orderForm.get('startDate')?.enable();
  this.orderForm.get('endDate')?.enable();
  this.orderForm.get('mealPreferences')?.enable();
  this.orderForm.get('recurringDays')?.enable();

  this.modalService.open(content, { size: 'lg' });
}

submitOrder() {
  // Validate form first
  if (!this.orderForm.valid) {
    console.error('Form is invalid:', this.orderForm.errors);
    this.alertService.showAlert({
      message: 'Please fill all required fields',
      type: 'error',
      autoDismiss: true,
      duration: 4000
    });
    return;
  }

  const value = this.orderForm.getRawValue();
  console.log('Form raw value:', value);

  // Additional validation for renewal mode
  if (this.isRenewalMode) {
    if (!value.startDate || !value.endDate) {
      this.alertService.showAlert({
        message: 'Please select start and end dates for renewal',
        type: 'error',
        autoDismiss: true,
        duration: 4000
      });
      return;
    }

    if (!value.recurringDays || value.recurringDays.length === 0) {
      this.alertService.showAlert({
        message: 'Please select at least one recurring day',
        type: 'error',
        autoDismiss: true,
        duration: 4000
      });
      return;
    }

    if (!value.mealPreferences.breakfast && !value.mealPreferences.lunch && !value.mealPreferences.dinner) {
      this.alertService.showAlert({
        message: 'Please select at least one meal preference',
        type: 'error',
        autoDismiss: true,
        duration: 4000
      });
      return;
    }

    if (!this.selectedOrder) {
      this.alertService.showAlert({
        message: 'No order selected for renewal',
        type: 'error',
        autoDismiss: true,
        duration: 4000
      });
      return;
    }
  }

  // If renewal mode, use two-step process: create new order, then mark old as renewed
  if (this.isRenewalMode && this.selectedOrder) {
    const newOrderPayload = {
      name: value.customerName,
      address: value.customerAddress,
      delivery_address: value.deliveryAddress,
      location_url: value.locationUrl || '',
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
      remarks: value.remarks || ''
    };

    // console.log('=== RENEWAL PROCESS START ===');
    // console.log('Step 1: Creating new order with payload:', JSON.stringify(newOrderPayload, null, 2));

    this.service.createNewOrder(newOrderPayload).subscribe({
      next: (res: any) => {
        console.log('Step 1 SUCCESS: New order created:', res);
        console.log('Step 2: Marking old order as renewed. Order ID:', this.selectedOrder.id);

        this.service.renewOrder(this.selectedOrder.id, {}).subscribe({
          next: (renewRes: any) => {
            // console.log('Step 2 SUCCESS: Old order marked as renewed:', renewRes);
            // console.log('=== RENEWAL PROCESS COMPLETE ===');

            this.alertService.showAlert({
              message: 'Order Renewed Successfully',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            
            // Reload the list to show updated renewed status
            this.loadOrderList();
            this.orderForm.reset();
            this.isRenewalMode = false;
            this.selectedOrder = null;
            this.payableAmount = 0;
            this.modalService.dismissAll();
          },
          error: (renewErr) => {
            console.error('Step 2 FAILED: Could not mark old order as renewed');
            console.error('Full error object:', renewErr);
            console.error('Error status:', renewErr.status);
            console.error('Error statusText:', renewErr.statusText);
            console.error('Error body:', renewErr.error);
            console.error('Error message:', renewErr.error?.message || renewErr.message);
            
            if (renewErr.error) {
              console.error('Detailed error:', JSON.stringify(renewErr.error, null, 2));
            }
            
            // console.error('Request URL:', renewErr.url);
            // console.error('=== RENEWAL PROCESS INCOMPLETE ===');
            // console.warn('Note: New order was created successfully, but old order could not be marked as renewed');

            // New order was created, but marking as renewed failed
            // Still show success since the new order exists
            let warningMessage = 'New order created successfully, but there was an issue marking the old order as renewed.';
            
            if (renewErr.error?.message) {
              warningMessage += ` Error: ${renewErr.error.message}`;
            }
            
            this.alertService.showAlert({
              message: warningMessage,
              type: 'warning',
              autoDismiss: true,
              duration: 8000
            });
            this.loadOrderList();
            this.orderForm.reset();
            this.isRenewalMode = false;
            this.selectedOrder = null;
            this.payableAmount = 0;
            this.modalService.dismissAll();
          }
        });
      },
      error: (err) => {
        // console.error('Step 1 FAILED: Could not create new order:', err);
        // console.error('Error body:', JSON.stringify(err.error, null, 2));
        // console.error('=== RENEWAL PROCESS FAILED ===');

        this.alertService.showAlert({
          message: err.error?.message || 'Failed to create renewal order',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
      }
    });
    return;
  }

  // Create new order flow (non-renewal)
  const payload: any = {
    name: value.customerName,
    address: value.customerAddress,
    delivery_address: value.deliveryAddress,
    location_url: value.locationUrl || '',
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
    remarks: value.remarks || ''
  };

  // console.log('Create order payload:', JSON.stringify(payload, null, 2));

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
      this.isRenewalMode = false;
      this.payableAmount = 0;
      this.modalService.dismissAll();
    },
    error: (err) => {
      // console.error('Create order error:', err);
      // console.error('Error body:', JSON.stringify(err.error, null, 2));
      this.alertService.showAlert({
        message: err.error?.message || 'Failed to create order',
        type: 'error',
        autoDismiss: true,
        duration: 4000
      });
    }
  });
}

  onSubmitOrder() {
    if (this.isRenewalMode) {
      this.submitOrder();
    } else if (this.selectedOrder) {
      this.updateOrder();
    } else {
      this.submitOrder();
    }
  }

  openModal(content: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.selectedOrder = null;
    this.isRenewalMode = false;
    this.initForm();

    this.modalService.open(content, { size: 'lg' });
  }

  editOrder(order: any, content: any) {
    this.selectedOrder = order;
    this.isRenewalMode = false;

    const formattedRecurringDays = (order.recurring_days || []).map((day: string) => {
      return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    });

    this.orderForm.patchValue({
      customerName: order.name,
      email: order.email,
      customerAddress: order.address,
      deliveryAddress: order.delivery_address,
      locationUrl: order.location_url,
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
    // Don't allow toggling completed orders
    if (order.computedStatus === 'completed') {
      return;
    }

    const isCurrentlyActive = order.status === 'active';
    const newStatus = isCurrentlyActive ? 'paused' : 'active';
    const confirmationText = `Are you sure you want to ${isCurrentlyActive ? 'pause' : 'resume'} this order?`;

    this.confirmationService.confirm(confirmationText).then(confirmed => {
      if (confirmed) {
        this.service.pauseOrder(order.id, newStatus).subscribe({
          next: () => {
            order.status = newStatus;
            this.alertService.showAlert({
              message: `Order ${isCurrentlyActive ? 'Paused' : 'Resumed'}`,
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
              type: 'error',
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