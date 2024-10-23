import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { ReviewService } from '../services/review.service';

import { ResultsService } from '../services/results.service';
import { Review } from '../models/review';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {
  results : any;
  analyses: any[] = [];
  analysisInProgress: boolean = false;
  reviews: Review[] = []

  constructor(
    private router: Router,
    private resultsService : ResultsService,
    private alertController: AlertController,
    private title: Title,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    this.title.setTitle("DataprobeML- Results")
    this.loadReviews()
    if (history.state.review) {
      this.results = history.state.review;
      console.log(this.results)
    } else {
      this.results = this.resultsService.getResults();
      }

      this.filterAnalyses();
      console.log(this.analyses)

      if (this.analyses.length === 0) {
        this.errorsAlert(true); // Assign true for activate "back Home button"
      } else if (this.results.errors && this.results.errors.length > 0) {
        this.errorsAlert(false);
    }
  }

  loadReviews() {
    this.reviewService.loadReview().subscribe(
      (data: Review[]) => {
        this.reviews = data;
        console.log('Reviews uploaded successfully:', this.reviews);
      },
      error => {
        console.error('Error uploading revisions:', error);
      }
    );
  }

  filterAnalyses() {
    if (this.results) {
      const { bleuScore, crystalBleuScore, codeBleuScore } = this.results;

      if (bleuScore !== -1 && bleuScore !== 0) {
        this.analyses.push({ type: 'BLEU', score: bleuScore });
      }

      if (crystalBleuScore !== -1 && crystalBleuScore !== 0) {
        this.analyses.push({ type: 'CrystalBLEU', score: crystalBleuScore });
      }

      if (codeBleuScore !== -1 && codeBleuScore !== 0) {
        this.analyses.push({ type: 'CodeBLEU', score: codeBleuScore });
      }
    }
  }

  async errorsAlert(showHomeButton: boolean) {
    const maxVisibleErrors = 10; // Max visibe errors
    let showAll = false; //show more

    const getErrorMessages = () => {
      const visibleErrors = showAll ? this.results.errors : this.results.errors.slice(0, maxVisibleErrors);
      const errorMessages = visibleErrors.map((error: any) =>
        `${error.type}: ${error.error.replace(/\(<unknown>, line \d+\)/, '')}, in row: ${error.row}`
      ).join('\n');

      if (this.results.errors.length > maxVisibleErrors && !showAll) {
        return errorMessages + `\n\n...and ${this.results.errors.length - maxVisibleErrors} more errors`;
      }

      return errorMessages;
    };

    // function to create errors alert
    const createAlert = async () => {
      const alertButtons: any[] = [];

      if (this.results.errors.length > maxVisibleErrors) {
        alertButtons.push({
          text: showAll ? 'Show Less' : 'Show More',
          cssClass: 'alert-button-blue',
          handler: () => {
          showAll = !showAll; // Invert "Show More" and "Show Less"
          alert.dismiss().then(() => createAlert()); // Recreate alert
        },
      });
    }

    if(this.analyses.length > 0){
      alertButtons.push({
        text: 'OK',
        cssClass: 'alert-button-blue',
        role: 'cancel'
      });
    }

    //If there are no results, add "back home" button
    if(showHomeButton) {
      alertButtons.push({
        text: 'Back Home',
        cssClass: 'alert-button-blue',
        handler: () => {
          this.navigateToHome();
        },
      });
    }

    const alert = await this.alertController.create({
      header: 'Ops! There are some errors',
      message: getErrorMessages(),
      cssClass: `custom-alert ${showAll ? 'scrollable-alert' : ''}`,
      buttons: alertButtons,
    });

      await alert.present();
    };
    await createAlert();
  }

  deleteReview(reviewId: number) {
    this.reviewService.deleteReview(reviewId).subscribe(
      response => {
        console.log('Review deleted succesfully', response);
        this.deletedAlertConfirm();
      },
      error => {
        console.error('Error, review not deleted', error);
      }
    );
  }

  async deletedAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Review Deleted',
      message: 'The review has been successfully deleted.',
      buttons: [{
        text: 'OK',
        cssClass: 'alert-button-blue',
        handler: () => {
          this.navigateToHistory()
          window.location.reload()
        }
      }]
    });

    await alert.present();
  }

  //Alert if there is a review with the same name (change name)
  async presentExistingNameAlert(reviewId: number){
    const alert = await this.alertController.create({
      header: 'A review with this name already exists',
      message: 'Insert a different name',
      buttons: [
        {
          text: 'Ok',
          cssClass: 'alert-button-blue',
          handler: () => {
            this.changeReviewName(reviewId);
          }
        },
      ],
      backdropDismiss: false,
    })
    await alert.present()
  }

  //Alert for change review name
  async changeReviewName(reviewId: number) {
    let newReviewLabel = ''
    const alert = await this.alertController.create({
      header: 'Insert new review name:',
      inputs: [
        {
          placeholder: 'Name',
          cssClass: 'alert-input',
          attributes:{
            maxlength: 20,
          }
        },
      ],
      buttons: [
        {
          text: 'Confirm',
          cssClass: 'alert-button-blue',
          handler: (input) => {
            newReviewLabel = input[0] && input[0].trim() !== '' ? input[0].trim() : null;

            if (!newReviewLabel) {
              const defaultBaseName = 'defaultNameReview';
              let counter = 1;

              while (this.reviews.some(review => review.name === `${defaultBaseName}${counter}`)) {
                counter++;
              }

              newReviewLabel= `${defaultBaseName}${counter}`;
            }

            const reviewExists = this.reviews.some(review => review.name === newReviewLabel);

            if (reviewExists) {
              this.presentExistingNameAlert(reviewId);
            } else {
              this.reviewService.updateReviewName(reviewId, newReviewLabel);
              this.changeNameConfirm(newReviewLabel);
            }
        },
        },
        {
          text: 'Cancel',
          cssClass: 'alert-button-red',
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  //Alert for confirm name change
  async changeNameConfirm(newName: string) {
    const alert = await this.alertController.create({
      header: 'Name changed succesfully',
      message: `Review name has been successfully changed to "${newName}"`,
      buttons: [{
        text: 'OK',
        cssClass: 'alert-button-blue',
        handler: () => {
          this.navigateToHistory()
          window.location.reload()
        }
      }]
    });

    await alert.present();
  }

  navigateToHistory(){
    this.router.navigate(['/history']).then(() => {
      window.location.reload();
    });
  }

  navigateToHome(){
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }
}
