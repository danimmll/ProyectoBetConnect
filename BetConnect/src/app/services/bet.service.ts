import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import { Bet } from 'src/models/bet';
import { User } from 'src/models/user';

@Injectable({
  providedIn: 'root'
})
export class BetService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  async crearApuesta(apuesta: Bet) {
    return firstValueFrom(
      this.http.post<Bet>(`${this.apiUrl}/bets`, apuesta)
    );
  }

  async getMisApuestas(userId: number) {
    return firstValueFrom(
      this.http.get<Bet[]>(`${this.apiUrl}/bets/user/${userId}`)
    );
  }

  async getRanking() {
    return firstValueFrom(
      this.http.get<User[]>(`${this.apiUrl}/leaderboard`)
    );
  }
}