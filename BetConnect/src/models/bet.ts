import { Match } from "./match";

export interface Bet {
  id?: number;
  userId: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
  match?: Match;
}