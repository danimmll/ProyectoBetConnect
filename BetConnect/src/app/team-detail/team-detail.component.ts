import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SoccerService } from '../services/soccer.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TeamDetailComponent implements OnInit, OnDestroy {

  nombreUsuario = 'Usuario';
  avatarUsuario = this.avatarUrl('usuario');
  nombreEquipo = '';
  cargando = true;
  error = '';
  jugadores: any[] = [];
  standing: any = null;
  private routeSub?: Subscription;

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
    private location: Location,
    private authService: AuthService,
    private soccerService: SoccerService
  ) {}

  async ngOnInit() {
    await this.cargarUsuario();
    this.routeSub = this.route.paramMap.subscribe((params) => {
      void this.actualizarEquipoDesdeRuta(params.get('id'));
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  get victorias(): number { return this.standing?.wins ?? 0; }
  get empates(): number   { return this.standing?.draws ?? 0; }
  get derrotas(): number  { return this.standing?.losses ?? 0; }

  async recargar() { await this.cargarDatos(); }

  volver() { this.location.back(); }

  async cerrarSesion() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }

  getEscudo(nombre: string) {
    if (!nombre) return this.escudos['default'];
    const key = this.claveEquipo(nombre);
    return this.escudos[key] ?? this.escudos['default'];
  }

  avatarJugador(jugador: any): string {
    return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(jugador.name)}`;
  }

  private async cargarUsuario() {
    const user: any = await this.authService.getUser();
    if (user?.username) this.nombreUsuario = user.username;
    this.avatarUsuario = this.avatarUrl(user?.avatar ?? user?.username ?? user?.id ?? 'usuario');
  }

  private avatarUrl(seed: any): string {
    const safeSeed = String(seed ?? '').trim() || 'usuario';
    return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(safeSeed)}`;
  }

  private async cargarDatos() {
    this.cargando = true;
    this.error = '';
    this.jugadores = [];
    this.standing = null;

    try {
      const standings = await this.soccerService.getStandings();
      const tabla = this.mapearStandings(standings ?? []);
      const claveBuscada = this.claveEquipo(this.nombreEquipo);
      this.standing = tabla.find((item) => this.claveEquipo(item.teamName) === claveBuscada) ?? null;
      this.jugadores = await this.cargarJugadoresConAlias(this.nombreEquipo, this.standing?.teamName ?? '');
    } catch (error) {
      console.error(error);
      this.error = 'No se pudo cargar el detalle del equipo.';
      this.jugadores = [];
      this.standing = null;
    } finally {
      this.cargando = false;
    }
  }

  private async cargarJugadoresConAlias(...nombres: string[]): Promise<any[]> {
    const candidatos = this.generarAliasEquipos(nombres);
    for (const nombre of candidatos) {
      try {
        const players = await this.soccerService.getPlayers(nombre);
        const lista = Array.isArray(players) ? players : [];
        if (lista.length > 0) return [...lista].sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0));
      } catch (_) {}
    }
    return [];
  }

  private generarAliasEquipos(nombres: string[]): string[] {
    const base = nombres.map((n) => (n ?? '').trim()).filter((n) => !!n);
    const aliases = new Set<string>();
    for (const nombre of base) {
      aliases.add(nombre);
      aliases.add(nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      aliases.add(nombre.replace(/\b(fc|cf|ud|cd|rcd|deportivo|club|sad)\b/gi, ' ').replace(/\s+/g, ' ').trim());
      aliases.add(nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\b(fc|cf|ud|cd|rcd|deportivo|club|sad)\b/gi, ' ').replace(/\s+/g, ' ').trim());
    }
    return [...aliases].filter((n) => !!n);
  }

  private async actualizarEquipoDesdeRuta(teamParam: string | null) {
    const nombre = decodeURIComponent(teamParam ?? '').trim();
    this.nombreEquipo = nombre;
    if (!this.nombreEquipo) {
      this.error = 'Equipo invalido.';
      this.cargando = false;
      this.jugadores = [];
      this.standing = null;
      return;
    }
    await this.cargarDatos();
  }

  private mapearStandings(standings: any[]): any[] {
    const base: any[] = standings
      .map((item, index) => {
        const row = item as any;
        const teamName = this.obtenerNombreEquipo(row.teamName ?? row.team ?? row.name);
        if (!teamName) return null;
        const goalsFor     = this.aNumero(row.goalsFor ?? row.gf);
        const goalsAgainst = this.aNumero(row.goalsAgainst ?? row.gc);
        return {
          ...item,
          index,
          teamName,
          matchesPlayed: this.aNumero(row.matchesPlayed ?? row.pj),
          points:        this.aNumero(row.points ?? row.pts),
          wins:          this.aNumero(row.wins ?? row.won ?? row.pg),
          draws:         this.aNumero(row.draws ?? row.draw ?? row.pe),
          losses:        this.aNumero(row.losses ?? row.lost ?? row.pp),
          goalsFor,
          goalsAgainst
        };
      })
      .filter((item) => item !== null);

    const ordenados = [...base].sort((a, b) => {
      if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0);
      if ((b.goalDiff ?? 0) !== (a.goalDiff ?? 0)) return (b.goalDiff ?? 0) - (a.goalDiff ?? 0);
      return (a.index ?? 0) - (b.index ?? 0);
    });

    return ordenados.map((item, index) => ({ ...item, position: index + 1 }));
  }

  private claveEquipo(nombre: string): string {
    const normalizado = this.normalizarNombreEquipo(nombre);
    if (normalizado.includes('alaves'))     return 'alaves';
    if (normalizado.includes('almeria'))    return 'almeria';
    if (normalizado.includes('athletic'))   return 'athletic';
    if (normalizado.includes('atletico'))   return 'atletico';
    if (normalizado.includes('betis'))      return 'betis';
    if (normalizado.includes('cadiz'))      return 'cadiz';
    if (normalizado.includes('celta'))      return 'celta';
    if (normalizado.includes('barcelona'))  return 'barcelona';
    if (normalizado.includes('getafe'))     return 'getafe';
    if (normalizado.includes('girona'))     return 'girona';
    if (normalizado.includes('granada'))    return 'granada';
    if (normalizado.includes('palmas'))     return 'palmas';
    if (normalizado.includes('mallorca'))   return 'mallorca';
    if (normalizado.includes('osasuna'))    return 'osasuna';
    if (normalizado.includes('rayo'))       return 'rayo';
    if (normalizado.includes('real madrid') || normalizado === 'madrid') return 'madrid';
    if (normalizado.includes('sociedad'))   return 'sociedad';
    if (normalizado.includes('sevilla'))    return 'sevilla';
    if (normalizado.includes('valencia'))   return 'valencia';
    if (normalizado.includes('villarreal')) return 'villarreal';
    return normalizado;
  }

  private normalizarNombreEquipo(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\b(fc|cf|ud|cd|rcd|deportivo|club|sad)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private aNumero(valor: unknown): number {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  private obtenerNombreEquipo(valor: any): string {
    if (typeof valor === 'string') return valor.trim();
    if (valor && typeof valor === 'object') return String(valor.name ?? valor.teamName ?? valor.team ?? '').trim();
    return '';
  }
}