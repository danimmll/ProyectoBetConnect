import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SoccerService } from '../services/soccer.service';

@Component({
  selector: 'app-liga',
  templateUrl: './liga.component.html',
  styleUrls: ['./liga.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class LigaComponent implements OnInit {

  tabla: any[] = [];
  partidos: any[] = [];
  partidosPorJornada: Record<number, any[]> = {};
  cargando = true;
  error = '';
  nombreUsuario = 'Usuario';
  avatarUsuario = '';
  jornadaActual = 1;
  soccerService: SoccerService;
  authService: AuthService;
  router: Router;
  readonly jornadaMin = 1;
  readonly jornadaMax = 38;

  escudos: Record<string, string> = {
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

  constructor(soccerService: SoccerService, authService: AuthService, router: Router) {
    this.soccerService = soccerService;
    this.authService = authService;
    this.router = router;
  }

  async ngOnInit() {
    const user: any = await this.authService.getUser();
    this.nombreUsuario = user?.username ?? 'Usuario';
    this.avatarUsuario = `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(this.nombreUsuario)}`;
    await this.cargarTabla();
  }

  get partidosJornadaActual(): any[] {
    return this.partidosPorJornada[this.jornadaActual] ?? [];
  }

  get puedeIrAnterior(): boolean { return this.jornadaActual > this.jornadaMin; }
  get puedeIrSiguiente(): boolean { return this.jornadaActual < this.jornadaMax; }
  get jornadaRealActual(): number { return this.detectarJornadaActual(); }

  async irDetalleEquipo(nombre: string) {
    await this.router.navigate(['/team-detail', encodeURIComponent(nombre)]);
  }

  getEscudo(nombre: string): string {
    const key = this.claveEquipo(nombre);
    return this.escudos[key] ?? this.escudos['default'];
  }

  async cambiarJornada(direccion: -1 | 1) {
    const nuevaJornada = this.jornadaActual + direccion;
    if (nuevaJornada < this.jornadaMin || nuevaJornada > this.jornadaMax) return;
    this.jornadaActual = nuevaJornada;
    await this.cargarPartidosJornada(this.jornadaActual);
  }

  async recargar() { await this.cargarTabla(); }

  async cerrarSesion() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }

  detectarJornadaActual(): number {
    const live = this.partidos.find(p => p.status === 'live');
    if (live?.jornada) return live.jornada;
    const pending = this.partidos.find(p => p.status === 'pending');
    if (pending?.jornada) return pending.jornada;
    if (this.partidos.length > 0) return this.partidos[0].jornada;
    return 1;
  }

  cargarTabla = async () => {
    this.cargando = true;
    this.error = '';
    try {
      const standings = await this.soccerService.getStandings();
      const partidos  = await this.soccerService.getPartidos();
      this.tabla    = this.mapearStandings(standings ?? []);
      this.partidos = partidos ?? [];
      if (this.partidos.length > 0) {
        this.jornadaActual = this.detectarJornadaActual();
        this.partidosPorJornada[this.jornadaActual] = [...this.partidos];
      }
      if (this.tabla.length === 0) this.error = 'No hay datos de clasificacion.';
    } catch (e) {
      console.error(e);
      this.error = 'No se pudo cargar la clasificacion.';
      this.tabla = [];
    } finally {
      this.cargando = false;
    }
  }

  cargarPartidosJornada = async (jornada: number) => {
    if (this.partidosPorJornada[jornada]) return;
    const datos = await this.soccerService.getResultadosJornada(jornada);
    this.partidosPorJornada[jornada] = datos ?? [];
  }

  mapearStandings(standings: any[]): any[] {
    const base = standings
      .map((item: any, index) => {
        const teamName = String(item.team ?? item.teamName ?? item.name ?? '').trim();
        if (!teamName) return null;
        return {
          ...item,
          index,
          teamName,
          points:        Number(item.points ?? item.pts ?? 0),
          matchesPlayed: Number(item.matchesPlayed ?? item.pj ?? 0),
          wins:          Number(item.wins ?? item.won ?? item.pg ?? 0),
          draws:         Number(item.draws ?? item.draw ?? item.pe ?? 0),
          losses:        Number(item.losses ?? item.lost ?? item.pp ?? 0),
          goalsFor:      Number(item.goalsFor ?? item.gf ?? 0),
          goalsAgainst:  Number(item.goalsAgainst ?? item.gc ?? 0)
        };
      })
      .filter(item => item !== null);

    const ordenados = [...base].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (a.index ?? 0) - (b.index ?? 0);
    });

    return ordenados.map((item, index) => ({ ...item, position: index + 1 }));
  }

  claveEquipo(nombre: string): string {
    const n = (nombre ?? '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\b(fc|cf|ud|cd|rcd|deportivo|club|sad)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

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
    return n;
  }
}
