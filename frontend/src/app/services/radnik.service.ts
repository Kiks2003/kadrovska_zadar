import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Dokument,
  PaginatedResponse,
  RadnaDozvola,
  RadnaDozvolaPayload,
  Radnik,
  RadnikCreatePayload
} from '../models/radnik';

@Injectable({
  providedIn: 'root'
})
export class RadnikService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'api/kadrovska-zadar/radnici/';
  private readonly DOZVOLE_URL = 'api/kadrovska-zadar/dozvole/';
  private readonly DOKUMENTI_URL = 'api/kadrovska-zadar/dokumenti/';

  getRadnici(params: Record<string, string> = {}): Observable<PaginatedResponse<Radnik>> {
    return this.http.get<PaginatedResponse<Radnik>>(this.BASE_URL, { params });
  }

  getRadnik(id: number): Observable<Radnik> {
    return this.http.get<Radnik>(`${this.BASE_URL}${id}/`);
  }

  createRadnik(payload: RadnikCreatePayload): Observable<Radnik> {
    return this.http.post<Radnik>(this.BASE_URL, payload);
  }

  updateRadnik(id: number, payload: RadnikCreatePayload): Observable<Radnik> {
    return this.http.put<Radnik>(`${this.BASE_URL}${id}/`, payload);
  }

  deleteRadnik(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}${id}/`);
  }

  createDozvola(payload: RadnaDozvolaPayload): Observable<RadnaDozvola> {
    return this.http.post<RadnaDozvola>(this.DOZVOLE_URL, payload);
  }

  updateDozvola(id: number, payload: RadnaDozvolaPayload): Observable<RadnaDozvola> {
    return this.http.put<RadnaDozvola>(`${this.DOZVOLE_URL}${id}/`, payload);
  }

  deleteDozvola(id: number): Observable<void> {
    return this.http.delete<void>(`${this.DOZVOLE_URL}${id}/`);
  }

  uploadDokument(data: FormData): Observable<Dokument> {
    return this.http.post<Dokument>(this.DOKUMENTI_URL, data);
  }

  // PDF kao Blob; preuzmi=true vraća ga kao privitak (Content-Disposition: attachment).
  getDokumentPdf(id: number, preuzmi = false): Observable<Blob> {
    const params = preuzmi ? { preuzmi: '1' } : undefined;
    return this.http.get(`${this.DOKUMENTI_URL}${id}/sadrzaj/`, { params, responseType: 'blob' });
  }

  deleteDokument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.DOKUMENTI_URL}${id}/`);
  }
}
