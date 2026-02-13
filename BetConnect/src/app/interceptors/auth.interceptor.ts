import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  
  return from(Preferences.get({ key: 'token_bet' })).pipe(
    switchMap(tokenData => {
      const token = tokenData.value;
      
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      
      return next(req);
    })
  );
};