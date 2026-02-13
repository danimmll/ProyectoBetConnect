import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class PerfilComponent implements OnInit {

  nombreUsuario = 'Usuario';
  puntos = 0;
  usernameEdit = '';
  avatarSeleccionado = 'star';
  miembroDesde = new Date().getFullYear();
  avatares = ['person', 'football', 'star', 'trophy', 'rocket', 'flame', 'flash', 'medal'];

  private user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const authUser: any = await this.authService.getUser();
    const stored = await this.obtenerUsuarioGuardado();
    this.user = { ...(stored ?? {}), ...(authUser ?? {}) };

    if (this.user?.username) {
      this.nombreUsuario = this.user.username;
      this.usernameEdit  = this.user.username;
    }
    if (typeof this.user?.points === 'number') this.puntos = this.user.points;
    if (this.user?.avatar) this.avatarSeleccionado = this.user.avatar;
  }

  seleccionarAvatar(avatar: string) {
    this.avatarSeleccionado = avatar;
  }

  get avatarUrlSeleccionado(): string {
    return this.avatarUrl(this.avatarSeleccionado);
  }

  avatarUrl(seed: string): string {
    const safeSeed = String(seed ?? '').trim() || 'usuario';
    return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(safeSeed)}`;
  }

  async guardarCambios() {
    const username = this.usernameEdit.trim();
    if (username.length < 3) {
      await this.mostrarToast('El usuario debe tener al menos 3 caracteres.');
      return;
    }

    const actualizado = { ...this.user, username, avatar: this.avatarSeleccionado };
    await Preferences.set({ key: 'user_bet', value: JSON.stringify(actualizado) });
    await Preferences.set({ key: 'user',     value: JSON.stringify(actualizado) });
    this.authService.usuarioActual = actualizado;
    this.user = actualizado;
    this.nombreUsuario = username;
    await this.mostrarToast('Perfil actualizado.', 'success');
  }

  async cerrarSesion() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }

  private async obtenerUsuarioGuardado(): Promise<any> {
    const [userBet, userLegacy] = await Promise.all([
      Preferences.get({ key: 'user_bet' }),
      Preferences.get({ key: 'user' })
    ]);
    const raw = userBet.value ?? userLegacy.value;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  private async mostrarToast(mensaje: string, color: 'danger' | 'success' = 'danger') {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }
}