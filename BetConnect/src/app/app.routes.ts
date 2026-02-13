import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PanelComponent } from './panel/panel.component';
import { LigaComponent } from './liga/liga.component';
import { MatchDetailComponent } from './match-detail/match-detail.component';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { RankingComponent } from './ranking/ranking.component';
import { HistorialComponent } from './historial/historial.component';
import { PerfilComponent } from './perfil/perfil.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'panel', component: PanelComponent,canActivate: [authGuard]},
    {path: 'match-detail/:id', component: MatchDetailComponent,canActivate: [authGuard]},
    {path: 'team-detail/:id', component: TeamDetailComponent,canActivate: [authGuard]},
    {path: 'liga', component: LigaComponent,canActivate: [authGuard]},
    {path: 'ranking', component: RankingComponent,canActivate: [authGuard]},
    {path: 'historial', component: HistorialComponent,canActivate: [authGuard]},
    {path: 'perfil', component: PerfilComponent,canActivate: [authGuard]},
    {path: '**', component: LoginComponent},
];