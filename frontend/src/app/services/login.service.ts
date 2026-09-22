import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Korisnik, LoginRequest } from '../models/korisnik';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);

  private readonly LOGIN_URL = 'api/accounts/login/';
  private readonly LOGOUT_URL = 'api/accounts/logout/';
  private readonly CHECK_USER_URL = 'api/accounts/check-user/';

  isLoggedIn = signal<boolean>(false);
  korisnik = signal<Korisnik | undefined>(undefined);

  checkSession(): Observable<Korisnik> {
    return this.http.get<Korisnik>(this.CHECK_USER_URL).pipe(
      tap(korisnik => {
        this.isLoggedIn.set(korisnik.logged_in);
        this.korisnik.set(korisnik);
      }),
      catchError(() => {
        this.clearUser();
        return of({ logged_in: false } as Korisnik);
      })
    );
  }

  postLogin(credentials: LoginRequest): Observable<Korisnik> {
    return this.http.post<Korisnik>(this.LOGIN_URL, credentials).pipe(
      tap(korisnik => {
        this.isLoggedIn.set(true);
        this.korisnik.set(korisnik);
      })
    );
  }

  postLogout(): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(this.LOGOUT_URL, {}).pipe(
      tap(() => this.clearUser())
    );
  }

  clearUser(): void {
    this.isLoggedIn.set(false);
    this.korisnik.set(undefined);
  }
}
