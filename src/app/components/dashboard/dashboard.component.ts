import { Component, OnInit } from '@angular/core';
import { DashboardService } from './service/dashboard.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../shared/components/alert/service/alert.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  allData!: any;
  allDeliveries!: any;

  loadingCards = false;
  loadingTable = false;

  constructor(
    private service: DashboardService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadData()
    this.loadDeliveries()
  }

  loadData() {
    this.loadingCards = true;
    this.service.getAnalytics().subscribe({
      next: (res: any) => {
        this.allData = res.data || {}
        this.loadingCards = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert({
          message: err.error.message || 'Update failed',
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
        this.loadingCards = false;
      }
    })
  }

  loadDeliveries() {
    this.loadingTable = true;
    this.service.getDeliveries().subscribe({
      next: (res: any) => {
        this.allDeliveries = res.data || []
        this.loadingTable = false;
      },
      error: (err) => {
        console.error(err);
        this.alertService.showAlert({
          message: err.error.message,
          type: 'error',
          autoDismiss: true,
          duration: 4000
        });
        this.loadingTable = false;
      }
    })
  }

}
