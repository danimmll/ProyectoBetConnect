import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { SoccerService } from '../services/soccer.service';
import { AuthService } from '../services/auth.service';
import { BetService } from '../services/bet.service';

@Component({
  selector: 'app-match-detail',
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class MatchDetailComponent implements OnInit, OnDestroy {

  nombreUsuario = 'Usuario';
  avatarUsuario = this.avatarUrl('usuario');
  partido: any = null;
  tablaLiga: any[] = [];
  cargando = true;
  intervalo: any;

  golesLocal: number | null = null;
  golesVisitante: number | null = null;
  enviandoApuesta = false;

  escudos: any = {
    alaves:     'assets/escudos/alaves.png',
    almeria:    'assets/escudos/almeria.png',
    athletic:   'assets/escudos/athletic.png',
    atletico:   'assets/escudos/atletico.png',
    betis:      'assets/escudos/betis.png',
    cadiz:      'assets/escudos/cadiz.png',
    celta:      'assets/escudos/celta.png',
    barcelona:  'assets/escudos/fc_barcelona.png',
    getafe:     'assets/escudos/getafe.png',
    girona:     'assets/escudos/girona.png',
    granada:    'assets/escudos/granada.png',
    palmas:     'assets/escudos/las_palmas.png',
    mallorca:   'assets/escudos/mallorca.png',
    osasuna:    'assets/escudos/osasuna.png',
    rayo:       'assets/escudos/rayo.png',
    madrid:     'assets/escudos/real_madrid.png',
    sociedad:   'assets/escudos/real_sociedad.png',
    sevilla:    'assets/escudos/sevilla.png',
    valencia:   'assets/escudos/valencia.png',
    villarreal: 'assets/escudos/villarreal.png',
    default:    'assets/icon/favicon.png'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private soccerService: SoccerService,
    private authService: AuthService,
    private betService: BetService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarUsuario();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.cargarDatos(id);
      this.intervalo = setInterval(() => this.refrescarPartido(id), 10000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  async cargarDatos(id: any) {
    this.cargando = true;
    try {
      const standings = await this.soccerService.getStandings();
      const match = await this.soccerService.getMatch(id);
      this.partido = match || null;
      this.tablaLiga = this.mapearStandings(standings || []);
    } catch (e) {
      this.partido = null;
      this.tablaLiga = [];
      this.mostrarToast('Error cargando el partido', 'danger');
    }
    this.cargando = false;
  }

  async refrescarPartido(id: any) {
    await this.cargarDatos(id);
  }

  getEscudo(nombre: string) {
    if (!nombre) return this.escudos['default'];
    const key = this.claveEquipo(nombre);
    return this.escudos[key] || this.escudos['default'];
  }

  mapearStandings(lista: any[]): any[] {
    return lista
      .map((t, i) => ({
        ...t,
        position: i + 1,
        teamName: this.obtenerNombreEquipo(t.teamName || t.team || t.name),
        points: Number(t.points || t.pts || 0),
        matchesPlayed: Number(t.matchesPlayed || t.pj || 0),
        wins: Number(t.wins || t.pg || 0),
        draws: Number(t.draws || t.pe || 0),
        losses: Number(t.losses || t.pp || 0),
        goalsFor: Number(t.goalsFor || t.gf || 0),
        goalsAgainst: Number(t.goalsAgainst || t.gc || 0)
      }))
      .sort((a, b) => b.points - a.points);
  }

  claveEquipo(nombre: string): string {
    const n = nombre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (n.includes('alaves'))     return 'alaves';
    if (n.includes('almeria'))    return 'almeria';
    if (n.includes('athletic'))   return 'athletic';
    if (n.includes('atletico'))   return 'atletico';
    if (n.includes('betis'))      return 'betis';
    if (n.includes('cadiz'))      return 'cadiz';
    if (n.includes('celta'))      return 'celta';
    if (n.includes('barcelona'))  return 'barcelona';
    if (n.includes('getafe'))     return 'getafe';
    if (n.includes('girona'))     return 'girona';
    if (n.includes('granada'))    return 'granada';
    if (n.includes('palmas'))     return 'palmas';
    if (n.includes('mallorca'))   return 'mallorca';
    if (n.includes('osasuna'))    return 'osasuna';
    if (n.includes('rayo'))       return 'rayo';
    if (n.includes('madrid'))     return 'madrid';
    if (n.includes('sociedad'))   return 'sociedad';
    if (n.includes('sevilla'))    return 'sevilla';
    if (n.includes('valencia'))   return 'valencia';
    if (n.includes('villarreal')) return 'villarreal';
    return 'default';
  }

  obtenerNombreEquipo(valor: any): string {
    if (typeof valor === 'string') return valor;
    if (valor && typeof valor === 'object') return valor.name || '';
    return '';
  }

  async apostar() {
    if (this.golesLocal === null || this.golesVisitante === null) {
      this.mostrarToast('Introduce un resultado', 'warning');
      return;
    }

    const user: any = await this.authService.getUser();
    if (!user) {
      this.mostrarToast('Usuario no encontrado', 'danger');
      return;
    }

    const apuesta = {
      matchId: Number(this.partido.id || this.partido._id),
      userId: Number(user.id || user._id),
      homeScore: Number(this.golesLocal),
      awayScore: Number(this.golesVisitante)
    };

    this.enviandoApuesta = true;
    try {
      await this.betService.crearApuesta(apuesta);
      this.mostrarToast('Apuesta guardada', 'success');
    } catch {
      this.mostrarToast('Error al apostar', 'danger');
    }
    this.enviandoApuesta = false;
  }

  async cargarUsuario() {
    const user: any = await this.authService.getUser();
    if (user?.username) this.nombreUsuario = user.username;
    this.avatarUsuario = this.avatarUrl(user?.username || 'usuario');
  }

  avatarUrl(seed: any): string {
    return `https://api.dicebear.com/9.x/micah/svg?seed=${seed}`;
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 3000, color, position: 'top' });
    toast.present();
  }

  volver() {
    this.router.navigate(['/panel']);
  }

  async irDetalleEquipo(nombreEquipo: string | undefined) {
    if (!nombreEquipo) return;
    this.router.navigate(['/team-detail', encodeURIComponent(nombreEquipo)]);
  }
}