import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private BaseUrl = `${environment.apiUrl}/orders`
  private OrderCreateUrl = `${environment.apiUrl}/fleet-manager/create-customer-order`
  private mealTypeUrl = `${environment.apiUrl}/meal-types`

  constructor(
    private http: HttpClient
  ) { }

  getOrdersList() {
    return this.http.get(`${this.BaseUrl}`)
  }

  createNewOrder(itm: any) {
    return this.http.post(`${this.OrderCreateUrl}`, itm)
  }

  getMealTypes(){
    return this.http.get(`${this.mealTypeUrl}`)
  }

  getOrderByID(id: string | null){
    return this.http.get(`${this.BaseUrl}/${id}`)
  }
}
