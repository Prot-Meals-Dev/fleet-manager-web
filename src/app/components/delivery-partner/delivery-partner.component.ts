import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from '../../shared/components/confirmation-modal/service/confirmation.service';
import { AlertService } from '../../shared/components/alert/service/alert.service';
import { DeliveryPartnerService } from './service/delivery-partner.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

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
  editMode = false;
  selectedPartnerId: string | null = null;

  constructor(
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private service: DeliveryPartnerService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router
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

  openCreateModal(content: any, partner?: any) {
    this.partnerForm.reset();
    this.editMode = !!partner;
    this.selectedPartnerId = partner?.id || null;

    if (partner) {
      this.partnerForm.patchValue({
        name: partner.name,
        email: partner.email,
        phone: partner.phone
      });
    }

    const buttonElement = document.activeElement as HTMLElement
    buttonElement.blur();

    this.modalService.open(content, { centered: true });
  }

  onSubmit(modal: any) {
    if (this.partnerForm.valid) {
      const formData = this.partnerForm.value;

      if (this.editMode && this.selectedPartnerId) {
        this.service.updatePartner(this.selectedPartnerId, formData).subscribe({
          next: () => {
            this.alertService.showAlert({
              message: 'Partner updated successfully',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadAllPartners();
          },
          error: (err) => {
            console.error(err);
            this.alertService.showAlert({
              message: err.error.message || 'Update failed',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      } else {
        this.service.createPartner(formData).subscribe({
          next: () => {
            this.alertService.showAlert({
              message: 'Partner created successfully',
              type: 'success',
              autoDismiss: true,
              duration: 4000
            });
            this.loadAllPartners();
          },
          error: (err) => {
            console.error(err);
            this.alertService.showAlert({
              message: err.error.message || 'Creation failed',
              type: 'error',
              autoDismiss: true,
              duration: 4000
            });
          }
        });
      }

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

  goToPartnerDetail(orderId: string) {
    this.router.navigate(['/deliverypartnerdetail', orderId]);
  }

}
