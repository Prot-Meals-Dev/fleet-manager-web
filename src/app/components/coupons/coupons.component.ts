import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ConfirmationService } from '../../shared/components/confirmation-modal/service/confirmation.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { CouponsService } from './service/coupons.service';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-coupons',
  imports: [CommonModule, ReactiveFormsModule, PaginationModule, FormsModule, NgbDatepickerModule],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.css'
})
export class CouponsComponent implements OnInit {

  allCoupon!: any[];
  couponForm: FormGroup;
  isLoading = false;

  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private service: CouponsService,
    private fb: FormBuilder,
    private modalService: NgbModal,
  ) {
    this.couponForm = this.fb.group({
      text: ['', Validators.required],
      days_added: ['', [Validators.required, Validators.min(1)]],
      discount_price: ['', [Validators.required, Validators.min(0)]],
      expires_at: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAllCoupons()
  }

  loadAllCoupons() {
    this.isLoading = true;
    this.service.getCouponList().subscribe({
      next: (res: any) => {
        this.allCoupon = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert({
          message: 'Coupons not loaded. Try Again',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
        this.isLoading = false;
      }
    })
  }

  openCreateModal(content: any, cou?: any) {
    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.couponForm.reset();
    this.modalService.open(content, { centered: true });
  }

  onSubmit(modal: any) {
    if (this.couponForm.invalid) return;

    const formValue = this.couponForm.value;
    const expDate = formValue.expires_at;

    const payload = {
      ...formValue,
      expires_at: new Date(expDate.year, expDate.month - 1, expDate.day).toISOString()
    };

    this.service.createCoupon(payload).subscribe({
      next: () => {
        this.alertService.showAlert({
          message: 'Coupon created successfully',
          type: 'success',
          autoDismiss: true,
          duration: 3000
        });
        this.loadAllCoupons();
        modal.close();
      },
      error: () => {
        this.alertService.showAlert({
          message: 'Creation failed',
          type: 'error',
          autoDismiss: true,
          duration: 3000
        });
      }
    });
  }

  async deleteItem(cou: any) {
    const confirmed = await this.confirmationService.confirm('Do you really want to delete this coupon?');
    if (confirmed) {
      this.service.deleteCoupon(cou.id).subscribe({
        next: () => {
          this.alertService.showAlert({
            message: 'Coupon deleted successfully',
            type: 'success',
            autoDismiss: true,
            duration: 3000
          });
          this.loadAllCoupons();
        },
        error: () => {
          this.alertService.showAlert({
            message: 'Failed to delete coupon',
            type: 'error',
            autoDismiss: true,
            duration: 3000
          });
        }
      });
    }
  }

}
