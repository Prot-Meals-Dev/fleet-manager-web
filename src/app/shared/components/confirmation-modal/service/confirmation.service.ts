import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(private modalService: NgbModal) { }

  confirm(question: string): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'md'
    });
    modalRef.componentInstance.question = question;

    return new Promise<boolean>((resolve) => {
      modalRef.result
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  }
}
