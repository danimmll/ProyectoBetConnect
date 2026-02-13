import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoccerService {

  private apiUrl = environment.apiUrl;
  public partidosMemoria: any[] = [];

  constructor(private http: HttpClient) {}

async getPartidos() {
  try {
    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/matches?t=${Date.now()}`)
    );

    return Array.isArray(res) ? res : res?.data ?? [];
  } catch (error) {
    return [];
  }
}


  async getMatch(id: number) {
    try {
      const match: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/matches/${id}`)
      );

      const index = this.partidosMemoria.findIndex(p => p.id == id);

      if (index !== -1) {
        this.partidosMemoria[index] = match;
      } else {
        this.partidosMemoria.push(match);
      }

      return match;

    } catch (error) {
      return null;
    }
  }

  getMatchLocal(id: number) {
    return this.partidosMemoria.find(p => p.id == id);
  }

  async getStandings() {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/league/standings`)
      );
      return Array.isArray(res) ? res : [];
    } catch (error) {
      return [];
    }
  }

  async getPlayers(teamName: string) {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/teams/${teamName}/players`)
      );
      return Array.isArray(res) ? res : [];
    } catch (error) {
      return [];
    }
  }

  async getResultadosJornada(jornada: number) {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/league/results/${jornada}`)
      );
      return Array.isArray(res) ? res : [];
    } catch (error) {
      return [];
    }
  }
}
