import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
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
}
