import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPartnerService {
  private BaseUrl = `${environment.apiUrl}`

  constructor(
    private http: HttpClient
  ) { }

  // createPartner(itm: any) {
  //   return this.http
  // }
}
