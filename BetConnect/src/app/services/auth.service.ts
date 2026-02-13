import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = environment.apiUrl;

  private estaLogueado = new BehaviorSubject<boolean>(false);
  public usuarioActual: any = null;

  constructor(private http: HttpClient) {
    this.cargarSesion();
  }

  async cargarSesion() {
    const token = await Preferences.get({ key: 'token' });
    const user = await Preferences.get({ key: 'user' });

    if (token.value) {
      this.usuarioActual = user.value ? JSON.parse(user.value) : null;
      this.estaLogueado.next(true);
    } else {
      this.estaLogueado.next(false);
    }
  }

  login(credenciales: any) {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap(async (res: any) => {
        if (res.token) {
          await Preferences.set({ key: 'token', value: res.token });
          await Preferences.set({ key: 'user', value: JSON.stringify(res.user) });

          this.usuarioActual = res.user;
          this.estaLogueado.next(true);
        }
      })
    );
  }

  register(datos: any) {
    return this.http.post(`${this.apiUrl}/register`, datos).pipe(
      tap(async (res: any) => {
        if (res.token) {
          await Preferences.set({ key: 'token', value: res.token });
          await Preferences.set({ key: 'user', value: JSON.stringify(res.user) });

          this.usuarioActual = res.user;
          this.estaLogueado.next(true);
        }
      })
    );
  }

  async logout() {
    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'user' });

    this.usuarioActual = null;
    this.estaLogueado.next(false);
  }

  isLoggedIn() {
    return this.estaLogueado.asObservable();
  }

  async getUser() {
    if (this.usuarioActual) return this.usuarioActual;

    const user = await Preferences.get({ key: 'user' });
    return user.value ? JSON.parse(user.value) : null;
  }

  async getToken() {
    const token = await Preferences.get({ key: 'token' });
    return token.value;
  }
}
