import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPartnerService {
  private BaseUrl = `${environment.apiUrl}/fleet-manager/create-partner`
  private BaseUrl1 = `${environment.apiUrl}/users/delivery-partner`
  private UpdateUrl = `${environment.apiUrl}/fleet-manager/update-partner`
  private GetUserUrl = `${environment.apiUrl}/users`


  constructor(
    private http: HttpClient
  ) { }

  createPartner(itm: any) {
    return this.http.post(`${this.BaseUrl}`, itm)
  }

  getPartnerList() {
    return this.http.get(`${this.BaseUrl1}`)
  }

  updatePartner(id: string, itm: any) {
    return this.http.patch(`${this.UpdateUrl}/${id}`, itm)
  }

  getPartner(id: string | null){
    return this.http.get(`${this.GetUserUrl}/${id}`)
  }
}
