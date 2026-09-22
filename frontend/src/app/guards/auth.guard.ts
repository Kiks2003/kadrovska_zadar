import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  return loginService.checkSession().pipe(
    map(korisnik => korisnik.logged_in ? true : router.parseUrl('/auth/login')),
    catchError(() => of(router.parseUrl('/auth/login')))
  );
};
