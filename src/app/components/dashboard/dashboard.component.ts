import { Component, OnInit } from '@angular/core';
import { DashboardService } from './service/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  allData!: any;

  constructor(
    private service: DashboardService
  ) { }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    this.service.getAnalytics().subscribe({
      next: (res:any) => {
        this.allData = res.data || {}
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

}
