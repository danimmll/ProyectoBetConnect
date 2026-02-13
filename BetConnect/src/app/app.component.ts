import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  footballOutline, 
  gridOutline, 
  logOutOutline, 
  personCircleOutline, 
  personOutline, 
  searchOutline, 
  statsChartOutline, 
  timeOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline,
  football,
  shirt,
  warningOutline,
  radioButtonOnOutline,
  trophyOutline // <--- TE FALTABA ESTE IMPORT
} from 'ionicons/icons';
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonApp],
})
export class AppComponent implements OnInit {
  
  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'football-outline': footballOutline,
      'grid-outline': gridOutline,
      'stats-chart-outline': statsChartOutline,
      'person-circle-outline': personCircleOutline,
      'time-outline': timeOutline,
      'person-outline': personOutline,
      'search-outline': searchOutline,
      'log-out-outline': logOutOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'football': football,
      'shirt': shirt,
      'warning-outline': warningOutline,
      'radio-outline': radioButtonOnOutline,
      'trophy-outline': trophyOutline 
    });
  }

  ngOnInit() {
    this.auth.isLoggedIn().subscribe(estado => {
      if (estado) {
           this.router.navigate(['/panel']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}