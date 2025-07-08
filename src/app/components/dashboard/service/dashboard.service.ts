import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private BaseUrl = `${environment.apiUrl}/fleet-manager/analytics`
  private DeliveriesUrl = `${environment.apiUrl}/delivery-assignments`

  constructor(
    private http: HttpClient
  ) { }

  getAnalytics() {
    return this.http.get(`${this.BaseUrl}`)
  }

  getDeliveries() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    return this.http.get(`${this.DeliveriesUrl}/my-deliveries?date=${formattedDate}`);
  }
}
