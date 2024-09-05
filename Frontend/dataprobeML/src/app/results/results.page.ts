import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { ResultsService } from '../services/results.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {
  results : any

  constructor(
    private router: Router,
    private resultsService : ResultsService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    if (history.state.review) {
      this.results = history.state.review;
      console.log(this.results)
    } else {
      this.results = this.resultsService.getResults();
      if (this.results.errors && this.results.errors.length > 0) {
        this.presentAlert();
      }
    }
  }

  async presentAlert() {
    const errorMessages = this.results.errors.map((error: any) => `${error.type}: ${error.error.replace(/\(<unknown>, line \d+\)/, '')}, in row: ${error.row}`).join('\n');
    const alert = await this.alertController.create({
      header: 'Ops! There are some errors',
      message: errorMessages,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-blue',
        },
      ],
    });
    await alert.present();
  }

  navigateToHome(){
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }
}
