import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {

  private BaseUrl = `${environment.apiUrl}/coupons`

  constructor(
    private http: HttpClient
  ) { }

  getCouponList() {
    return this.http.get(`${this.BaseUrl}`)
  }

  createCoupon(itm: any) {
    return this.http.post(`${this.BaseUrl}`, itm)
  }

  // updateCoupon(id: string, itm: any) {
  //   return this.http.patch(`${this.BaseUrl}/update-coupon/${id}`, itm)
  // }

  deleteCoupon(id: number) {
    return this.http.delete(`${this.BaseUrl}/${id}`);
  }
}
