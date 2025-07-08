import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private BaseUrl = `${environment.apiUrl}/fleet-manager/orders`
  private OrderUrl = `${environment.apiUrl}/fleet-manager`
  private mealTypeUrl = `${environment.apiUrl}/meal-types`

  constructor(
    private http: HttpClient
  ) { }

  getOrdersList() {
    return this.http.get(`${this.BaseUrl}`)
  }

  createNewOrder(itm: any) {
    return this.http.post(`${this.OrderUrl}/create-customer-order`, itm)
  }

  getMealTypes(){
    return this.http.get(`${this.mealTypeUrl}`)
  }

  getOrderByID(id: string | null){
    return this.http.get(`${this.BaseUrl}/${id}`)
  }

  updateOrder(itm: any, id: any){
    return this.http.patch(`${this.OrderUrl}/update-customer-order/${id}`, itm)
  }
}
