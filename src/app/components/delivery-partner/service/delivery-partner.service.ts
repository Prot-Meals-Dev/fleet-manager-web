import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPartnerService {
  private BaseUrl1 = `${environment.apiUrl}/users/delivery-partner`
  private GetUserUrl = `${environment.apiUrl}/users`
  private fleetManUrl = `${environment.apiUrl}/fleet-manager`

  constructor(
    private http: HttpClient
  ) { }

  createPartner(itm: any) {
    return this.http.post(`${this.fleetManUrl}/create-partner`, itm)
  }

  getPartnerList() {
    return this.http.get(`${this.BaseUrl1}`)
  }

  updatePartner(id: string, itm: any) {
    return this.http.patch(`${this.fleetManUrl}/update-partner/${id}`, itm)
  }

  getPartner(id: string | null) {
    return this.http.get(`${this.GetUserUrl}/${id}`)
  }

  loadDeliveries(id: string | null) {
    return this.http.get(`${this.fleetManUrl}/partner-orders/${id}`)
  }

  updateDeliverySequence(itm: any, id: any){
    return this.http.patch(`${this.fleetManUrl}/delivery-sequence/${id}`, itm)
  }
}
