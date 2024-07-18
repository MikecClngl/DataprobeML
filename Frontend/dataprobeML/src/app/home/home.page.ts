import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Review } from '../models/review';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
      private alertController: AlertController,
      private http: HttpClient,
      private router: Router,
      private reviewService : ReviewService
      ){}

  selectedFile: File | undefined;
  fileIsInsert: boolean = false;
  fileName: string | undefined;
  fileType: string | undefined;
  reviewLabel: string = "defaultReviewName";
  reviewModes: string[] = [];

  availableReviewModes = [
    { value: 'BLEU', label: 'BLEU' },
    { value: 'CODEBLEU', label: 'CODEBLEU' },
    { value: 'CRYSTALBLEU', label: 'CRYSTALBLEU' }
  ];

  //Manage file uploading
  handleFileInput(event: any){
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      this.fileIsInsert = true;
      this.fileName = file.name;
      this.fileType = file.type;
      console.log(file);
    }
  }

  //Function to see if almost one reviewMode is selected for activate button "submit"
  reviewModeSelected(): boolean {
    return this.reviewModes.length > 0;
  }

  //Alert for enter the name of review
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Insert review name:',
      inputs: [
        {
          placeholder: 'Name',
          cssClass: 'alert-input',
        },
      ],
      buttons: [
        {
          text: 'Confirm',
          cssClass: 'alert-button-blue',
          handler: (input) => {
            this.reviewLabel = input[0];
            //this.uploadReviewFile(input[0]);
            this.uploadReview(input[0]);
            //window.location.reload();
        },
        },
        {
          text: 'Cancel',
          cssClass: 'alert-button-red',
        },
      ],
    });
  await alert.present();
  }

  //send file to backend with reviewService
  uploadReview(reviewLabel: string){
    if (!this.selectedFile){
      console.error('No file selected');
      return;
    }
    const review = new Review(this.selectedFile, reviewLabel, reviewLabel, new Date(), this.reviewModes);
    this.reviewService.uploadReview(review).subscribe(response =>{
      console.log('Review caricata con successo:', response);
    }, error => {
      console.error('Errore durante il caricamento della review:', error);
    }
  );
    console.log(review);
  }

    navigateToHistory(){
      this.router.navigate(['/history']);
    }
}
