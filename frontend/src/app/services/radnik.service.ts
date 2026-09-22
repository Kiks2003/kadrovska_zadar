import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, Radnik, RadnikCreatePayload } from '../models/radnik';

@Injectable({
  providedIn: 'root'
})
export class RadnikService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'api/kadrovska-zadar/radnici/';

  getRadnici(): Observable<PaginatedResponse<Radnik>> {
    return this.http.get<PaginatedResponse<Radnik>>(this.BASE_URL);
  }

  createRadnik(payload: RadnikCreatePayload): Observable<Radnik> {
    return this.http.post<Radnik>(this.BASE_URL, payload);
  }

  deleteRadnik(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}${id}/`);
  }
}
