import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPartnerService {
  private BaseUrl = `${environment.apiUrl}/fleet-manager/create-partner`
  private BaseUrl1 = `${environment.apiUrl}/users/delivery-partner`

  constructor(
    private http: HttpClient
  ) { }

  createPartner(itm: any) {
    return this.http.post(`${this.BaseUrl}`, itm)
  }

  getPartnerList() {
    return this.http.get(`${this.BaseUrl1}`)
  }
}
