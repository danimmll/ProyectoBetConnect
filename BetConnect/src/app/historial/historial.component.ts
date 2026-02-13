import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { BetService } from '../services/bet.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class HistorialComponent implements OnInit {

  nombreUsuario = 'Usuario';
  avatarUsuario = '';
  cargando = true;
  error = '';
  apuestas: any[] = [];
  totalPuntos = 0;
  totalPorras = 0;
  winRate = 0;
  userId: number | null = null;

  constructor(
    private authService: AuthService,
    private betService: BetService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user: any = await this.authService.getUser();
    this.nombreUsuario = user?.username ?? 'Usuario';
    this.userId = user?.id ?? null;
    this.avatarUsuario = `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(this.nombreUsuario)}`;
    await this.cargarHistorial();
  }

  async recargar() {
    await this.cargarHistorial();
  }

  async cerrarSesion() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }

  async cargarHistorial() {
    this.cargando = true;
    this.error = '';
    try {
      if (this.userId === null) {
        this.error = 'No se pudo identificar el usuario.';
        this.apuestas = [];
        return;
      }
      this.apuestas = (await this.betService.getMisApuestas(this.userId)) ?? [];
      this.calcularResumen();
    } catch (e) {
      console.error(e);
      this.error = 'No se pudo cargar el historial.';
      this.apuestas = [];
      this.calcularResumen();
    } finally {
      this.cargando = false;
    }
  }

  calcularResumen() {
    this.totalPorras = this.apuestas.length;
    this.totalPuntos = this.apuestas.reduce((total, bet) => total + (bet.pointsEarned ?? 0), 0);
    const aciertos = this.apuestas.filter((bet) => (bet.pointsEarned ?? 0) > 0).length;
    this.winRate = this.totalPorras === 0 ? 0 : Math.round((aciertos * 100) / this.totalPorras);
  }
}