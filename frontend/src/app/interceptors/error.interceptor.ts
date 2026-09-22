import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../services/login.service';

function isAuthFailure(err: HttpErrorResponse): boolean {
  if (err.status === 401) {
    return true;
  }
  if (err.status !== 403) {
    return false;
  }
  const detail = String(err.error?.detail ?? '').toLowerCase();
  return detail.includes('authentication credentials') || detail.includes('not authenticated');
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const loginService = inject(LoginService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isAuthFailure(err)) {
        loginService.clearUser();
        router.navigate(['/auth/login']).then();
      }
      return throwError(() => err);
    })
  );
};
