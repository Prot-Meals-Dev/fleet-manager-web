import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private BaseUrl = `${environment.apiUrl}/fleet-manager/analytics`

  constructor(
    private http: HttpClient
  ) { }

  getAnalytics(){
    return this.http.get(`${this.BaseUrl}`)
  }
}
