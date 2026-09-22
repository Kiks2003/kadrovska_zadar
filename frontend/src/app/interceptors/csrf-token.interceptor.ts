import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

export const csrfTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);

  if (req.method === 'GET') {
    return next(req);
  }

  const csrfToken = cookieService.get('csrftoken');

  return next(req.clone({
    headers: req.headers.set('X-CSRFToken', csrfToken)
  }));
};
