import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from '../../shared/components/confirmation-modal/service/confirmation.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { DeliveryPartnerService } from './service/delivery-partner.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delivery-partner',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './delivery-partner.component.html',
  styleUrl: './delivery-partner.component.css'
})
export class DeliveryPartnerComponent implements OnInit {
  allPartners!: any[];
  partnerForm: FormGroup;
  isLoading = false;

  constructor(
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private service: DeliveryPartnerService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.partnerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAllPartners()
  }

  loadAllPartners() {
    this.isLoading = true;
    this.service.getPartnerList().subscribe({
      next: (res: any) => {
        this.allPartners = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert({
          message: 'Partners not loaded. Try Again',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
        this.isLoading = false;
      }
    })
  }

  openCreateModal(content: any) {
    this.partnerForm.reset();

    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.modalService.open(content, { centered: true });
  }

  onSubmit(modal: any) {
    if (this.partnerForm.valid) {
      const formData = this.partnerForm.value;

      this.service.createPartner(formData).subscribe({
        next: (res) => {
          this.alertService.showAlert({
            message: 'Partner Created successfully',
            type: 'success',
            autoDismiss: true,
            duration: 4000
          });
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

      modal.close();
    }
  }

  async deleteItem() {
    this.alertService.showAlert({
      message: 'Plan updated successfully',
      type: 'success',
      autoDismiss: true,
      duration: 4000
    });
    const confirmed = await this.confirmationService.confirm('Do you really want to delete this item?');
    if (confirmed) {
      // proceed with deletion
    }
  }

}
