import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private BaseUrl = `${environment.apiUrl}/orders`

  constructor(
    private http: HttpClient
  ) { }

  getOrdersList() {
    return this.http.get(`${this.BaseUrl}`)
  }

  createNewOrder(itm: any) {
    return this.http.post(`${this.BaseUrl}`, itm)
  }
}
