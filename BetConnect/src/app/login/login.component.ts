import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginComponent {
  credenciales = {
    email: '', 
    password: ''
  };

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private toastCtrl: ToastController
  ) {}

  async login() {
    const email = this.credenciales.email.trim();
    const password = this.credenciales.password.trim();

    if (!email || !password) {
      this.mostrarToast('Por favor, completa correo y contraseña.');
      return;
    }

    this.auth.login({ email, password }).subscribe({
      next: async (res) => {
        console.log('Login exitoso:', res);
        await this.router.navigate(['/panel']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.mostrarToast(this.getAuthErrorMessage(error));
      }
    });
  }

  private getAuthErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Error inesperado al iniciar sesión';
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor (Revisa que el backend esté encendido)';
    }

    if (error.status === 401 || error.status === 400) {
      return 'Usuario o contraseña incorrectos';
    }

    if (error.status === 503) {
      return 'El servidor se está iniciando, intenta en unos segundos';
    }

    return error.error?.error || 'No se pudo iniciar sesión';
  }

  async mostrarToast(mensaje: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom',
      icon: 'alert-circle-outline'
    });
    await toast.present();
  }
}