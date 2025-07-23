import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private BaseUrl = `${environment.apiUrl}/fleet-manager/orders`
  private OrderUrl = `${environment.apiUrl}/fleet-manager`
  private mealTypeUrl = `${environment.apiUrl}/meal-types`
  private OrderDetailUrl = `${environment.apiUrl}/orders`

  constructor(
    private http: HttpClient
  ) { }

  getOrdersList(filters?: any) {
    let queryParams = [];

    if (filters?.deliveryPartnerId) {
      queryParams.push(`deliveryPartnerId=${filters.deliveryPartnerId}`);
    }

    if (filters?.date) {
      const date = filters.date;
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      const formattedDate = `${date.year}-${pad(date.month)}-${pad(date.day)}`;
      queryParams.push(`date=${formattedDate}`);
    }

    if (filters?.status) {
      queryParams.push(`status=${filters.status}`);
    }

    if (filters?.limit) {
      queryParams.push(`limit=${filters.limit}`);
    }

    if (filters?.page) {
      queryParams.push(`page=${filters.page}`);
    }

    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';

    return this.http.get(`${this.BaseUrl}${queryString}`);
  }

  createNewOrder(itm: any) {
    return this.http.post(`${this.OrderUrl}/create-customer-order`, itm)
  }

  getMealTypes() {
    return this.http.get(`${this.mealTypeUrl}`)
  }

  getOrderByID(id: string | null) {
    return this.http.get(`${this.OrderDetailUrl}/${id}`)
  }

  updateOrder(itm: any, id: any) {
    return this.http.patch(`${this.OrderUrl}/update-customer-order/${id}`, itm)
  }

  pauseOrder(id: string, status: string) {
    return this.http.patch(`${this.OrderDetailUrl}/${id}/status/${status}`, {})
  }

  customPauseOrder(id: any, dates: any[]) {
    let itm = {
      dates: dates
    }
    return this.http.patch(`${this.OrderDetailUrl}/${id}/pause-days`, itm)
  }

}
