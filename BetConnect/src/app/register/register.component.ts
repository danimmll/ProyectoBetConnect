import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class RegisterComponent {
  
  credenciales = {
    usuario: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private toastCtrl: ToastController
  ) {}

  async registrarse() {
    const usuario = this.credenciales.usuario.trim();
    const email = this.credenciales.email.trim().toLowerCase();
    const password = this.credenciales.password.trim();

    if (!usuario || !email || !password) {
      this.mostrarToast('Por favor, rellena todos los campos.');
      return;
    }

    if (usuario.length < 3) {
      this.mostrarToast('El usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (!email.includes('@')) {
      this.mostrarToast('Introduce un email válido.');
      return;
    }

    if (password.length < 4) {
      this.mostrarToast('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    this.authService.register({
      username: usuario,
      email: email,
      password: password
    }).subscribe({
      next: async (res) => {
        console.log('Registro exitoso:', res);
        const toast = await this.toastCtrl.create({
          message: '¡Cuenta creada! Ya puedes iniciar sesión.',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
        
        await this.router.navigate(['/panel']);
      },
      error: (error) => {
        console.error('Error registro:', error);
        this.mostrarToast(this.getRegisterErrorMessage(error));
      }
    });
  }

  private getRegisterErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Error inesperado al registrarse';
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor';
    }

    if (error.status === 409) {
      return 'El usuario o el email ya existen';
    }

    if (error.status === 503) {
      return 'Servidor inicializándose, intenta en unos segundos';
    }

    return error.error?.message || error.error?.error || 'No se pudo crear la cuenta';
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      icon: 'warning-outline'
    });
    await toast.present();
  }
}