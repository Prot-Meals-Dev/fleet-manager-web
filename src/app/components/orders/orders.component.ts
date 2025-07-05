import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrdersService } from './service/orders.service';
import { NgbDatepickerModule, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../shared/components/alert/service/alert.service';


@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders = [
    {
      id: 201,
      name: 'John Doe',
      address: '123 Main Street, Mumbai',
      startDate: '2025-06-20',
      deliveryPartner: 'Ravi Kumar',
      paymentStatus: 'Paid',
      completed: true
    },
    {
      id: 202,
      name: 'Jane Smith',
      address: '456 Lake View, Delhi',
      startDate: '2025-06-21',
      deliveryPartner: 'Anjali Singh',
      paymentStatus: 'Unpaid',
      completed: false
    },
    {
      id: 203,
      name: 'David Johnson',
      address: '789 Hilltop Rd, Bangalore',
      startDate: '2025-06-22',
      deliveryPartner: 'Amit Sharma',
      paymentStatus: 'Paid',
      completed: false
    }
  ];

  filters = {
    startDate: '',
    paymentStatus: '',
    orderStatus: ''
  };
  orderForm!: FormGroup;
  orderList!: any[]
  deliveryPartners = ['Ravi Kumar', 'Anjali Singh', 'Amit Sharma'];
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  payableAmount: number = 0;

  constructor(
    private service: OrdersService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadOrderList()
    this.initForm();
  }

  initForm() {
    this.orderForm = this.fb.group({
      customerName: [''],
      email: [''], // 👈 Add this line
      contactNumber: [''],
      customerAddress: [''],
      gpsLocation: [''],
      deliveryAddress: [''],
      sameAsCustomer: [false],
      startDate: [null],
      endDate: [null],
      foodOption: [[]],
      recurringDays: [[]],
      deliveryPartner: ['']
    });

    this.orderForm.get('sameAsCustomer')?.valueChanges.subscribe(checked => {
      if (checked) {
        this.orderForm.patchValue({
          deliveryAddress: this.orderForm.value.customerAddress
        });
      }
    });
  }

  loadOrderList() {
    this.service.getOrdersList().subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  toggleFoodOption(option: string) {
    const selected = this.orderForm.value.foodOption as string[];
    if (selected.includes(option)) {
      this.orderForm.patchValue({
        foodOption: selected.filter(o => o !== option)
      });
    } else {
      this.orderForm.patchValue({
        foodOption: [...selected, option]
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
  }

  submitOrder() {
    if (this.orderForm.valid) {
      const formValue = { ...this.orderForm.value };

      formValue.startDate = this.formatDate(formValue.startDate);
      formValue.endDate = this.formatDate(formValue.endDate);

      console.log('Submitted Order:', formValue);

      this.service.createNewOrder(formValue).subscribe({
        next: (res) => {
          console.log(res);
          
          this.alertService.showAlert({
            message: 'Order Created',
            type: 'success',
            autoDismiss: true,
            duration: 4000
          });
          this.loadOrderList();
          this.orderForm.reset();
          this.modalService.dismissAll()
        },
        error: (err) => {
          console.log(err);
          
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


  openModal(content: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.modalService.open(content, { size: 'lg' });
  }

  resetFilters() {
    this.filters = {
      startDate: '',
      paymentStatus: '',
      orderStatus: ''
    };
  }

  formatDate(dateStruct: NgbDateStruct | null): string {
    if (!dateStruct) return '';
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${dateStruct.year}-${pad(dateStruct.month)}-${pad(dateStruct.day)}`;
  }
}
