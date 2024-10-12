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
  showColumnSelection = true;
  selectedColumnsButton = false;

  reviewLabel: string = "defaultReviewName";
  reviewModes: string[] = [];
  bleuScore: number = -1;
  crystalBleuScore: number = -1;
  codeBleuScore: number = -1;

  isDragging: boolean = false;

  availableReviewModes = [
    { value: 'BLEU', label: 'BLEU' },
    { value: 'CODEBLEU', label: 'CODEBLEU' },
    { value: 'CRYSTALBLEU', label: 'CRYSTALBLEU' }
  ];

  //Activate button for columns choise
  activateSelectedColumnsButton(): boolean{
    return this.selectedCandidateColumn != null && this.selectedReferenceColumn != null
  }

  //Confirm columns choise
  confirmButtonSelection() {
    if(this.selectedCandidateColumn != null && this.selectedReferenceColumn != null){
      console.log('Reference Column:', this.selectedReferenceColumn);
      console.log('Target Column:', this.selectedCandidateColumn);

      this.showColumnSelection = false;
    }
  }

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

  //Extract columns names of CSV
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

  //drag file
  onDragOver(event: DragEvent) {
    if (this.fileIsInsert) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
  }

  //drop file
  onDrop(event: DragEvent) {
    if (this.fileIsInsert) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isCSVFile(file)) {
        const fileInputEvent = { target: { files } };
        this.handleFileInput(fileInputEvent);
      } else {
        alert('Please upload a valid CSV file.');
      }
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const inBounds = event.clientX > rect.left && event.clientX < rect.right &&
                     event.clientY > rect.top && event.clientY < rect.bottom;

    if (!inBounds) {
      // Nascondi l'overlay solo se il puntatore esce dall'area del contenitore
      this.isDragging = false;
    }
  }

  //check if dropped file is a CSV
  isCSVFile(file: File): boolean {
    const fileType = file.type;
    const fileName = file.name;
    return fileType === 'text/csv' || fileName.endsWith('.csv');
  }

  closeColumnsChoise(){
    window.location.reload();
  }

  navigateToHistory(){
      this.router.navigate(['/history']);
  }
}
