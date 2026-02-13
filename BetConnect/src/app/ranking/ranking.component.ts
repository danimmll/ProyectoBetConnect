import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { BetService } from '../services/bet.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class RankingComponent implements OnInit {

  nombreUsuario = 'Usuario';
  avatarUsuario = '';
  cargando = true;
  error = '';
  ranking: any[] = [];

  constructor(
    private authService: AuthService,
    private betService: BetService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user: any = await this.authService.getUser();
    this.nombreUsuario = user?.username ?? 'Usuario';
    this.avatarUsuario = `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(this.nombreUsuario)}`;
    await this.cargarRanking();
  }

  get topTres(): any[] {
    return this.ranking.slice(0, 3);
  }

  async recargar() {
    await this.cargarRanking();
  }

  async cerrarSesion() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }

   async cargarRanking() {
    this.cargando = true;
    this.error = '';
    try {
      const datos = (await this.betService.getRanking()) ?? [];
      this.ranking = [...datos].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    } catch (e) {
      console.error(e);
      this.error = 'No se pudo cargar el ranking.';
      this.ranking = [];
    } finally {
      this.cargando = false;
    }
  }
}