import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmationService } from '../../shared/components/confirmation-modal/service/confirmation.service';

@Component({
  selector: 'app-delivery-partner',
  imports: [CommonModule],
  templateUrl: './delivery-partner.component.html',
  styleUrl: './delivery-partner.component.css'
})
export class DeliveryPartnerComponent {
  deliveryPartners = [
    {
      id: 101,
      name: 'Ravi Kumar',
      email: 'ravi@example.com',
      phone: '9876543210',
      ordersAssigned: 25,
      isActive: true
    },
    {
      id: 102,
      name: 'Anjali Singh',
      email: 'anjali@example.com',
      phone: '8765432109',
      ordersAssigned: 12,
      isActive: false
    },
    {
      id: 103,
      name: 'Amit Sharma',
      email: 'amit@example.com',
      phone: '9123456780',
      ordersAssigned: 8,
      isActive: true
    }
  ];

  constructor(
    private confirmationService: ConfirmationService
  ) { }

  async deleteItem() {
    const confirmed = await this.confirmationService.confirm('Do you really want to delete this item?');
    if (confirmed) {
      // proceed with deletion
    }
  }
  
}
