import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Review } from '../models/review';
import { ReviewService } from '../services/review.service';
import { ResultsService } from '../services/results.service';
import { Title } from '@angular/platform-browser';

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
      private reviewService : ReviewService,
      private resultsService : ResultsService,
      private titleService : Title
      ){
        this.titleService.setTitle('DataprobeML');
      }

  selectedFile: File | undefined;
  fileIsInsert: boolean = false;
  fileName: string | undefined;
  fileType: string | undefined;
  columnNames: string[] = [];
  selectedCandidateColumn: string | undefined;
  selectedReferenceColumn: string | undefined;

  reviewLabel: string = "defaultReviewName";
  reviewModes: string[] = [];
  bleuScore: number = -1;
  crystalBleuScore: number = -1;
  codeBleuScore: number = -1;

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

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = reader.result as string;
        this.extractColumnNames(text);
      };
      reader.readAsText(file);

      console.log(file);
    }
  }

  extractColumnNames(csvText: string) {
    const lines = csvText.split('\n');
    if (lines.length > 0) {
      this.columnNames = lines[0].split(','); // assuming CSV is comma separated
    }
  }

  //Function to see if almost one reviewMode is selected for activate button "submit"
  reviewModeSelected(): boolean {
    return this.reviewModes.length > 0;
  }

  //Alert for enter the name of review
  async presentReviewNameAlert() {
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
            this.uploadReview(input[0]);
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

  //send result to results page
  async presentConfirmationUploadAlert() {
    const alert = await this.alertController.create({
      header: 'Review uploaded succesfully!',
      buttons: [
        {
          text: 'Results',
          cssClass: 'alert-button-blue',
          handler: () => {
            this.router.navigate(['/results']);
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
    if (!this.selectedFile || !this.selectedCandidateColumn || !this.selectedReferenceColumn){
      console.error('File or column not selected');
      return;
    }
    const review = new Review(this.selectedFile, reviewLabel, reviewLabel, new Date(), this.reviewModes, this.bleuScore, this.crystalBleuScore, this.codeBleuScore, this.selectedCandidateColumn, this.selectedReferenceColumn);
    this.reviewService.uploadReview(review).subscribe(response =>{
      console.log('Review caricata con successo:', response);
      this.presentConfirmationUploadAlert();
      this.resultsService.setResults(response);
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
