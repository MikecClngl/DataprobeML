import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Review } from '../models/review';
import { ReviewService } from '../services/review.service';
import { ResultsService } from '../services/results.service';
import { Title } from '@angular/platform-browser';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(
      private alertController: AlertController,
      private http: HttpClient,
      private router: Router,
      private reviewService : ReviewService,
      private resultsService : ResultsService,
      private titleService : Title,
      private loadingController: LoadingController
      ){}

  ngOnInit(): void {
    this.titleService.setTitle("DataprobeML");
    this.loadReviews();
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
  reviewLabel: string = "";
  reviewModes: string[] = [];
  bleuScore: number = -1;
  crystalBleuScore: number = -1;
  codeBleuScore: number = -1;
  reviews: Review[] = [];


  isDragging: boolean = false;
  analysisInProgress: boolean = false;

  //load Reviews
  loadReviews() {
    const token = localStorage.getItem('token');
    if (token) {
      this.reviewService.loadReview(token).subscribe(
        (data: Review[]) => {
          this.reviews = data;
          console.log('Reviews loaded successfully:', this.reviews);
        },
        error => {
          console.error('Error loading reviews:', error);
        }
      );
    } else {
      console.error('Token not found. Redirecting to login.');
      this.router.navigate(['/login']);
    }
  }

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
      this.presentAnalysisSelectionAlert();
    }
  }

  //show loading bar
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Processing results...',
      duration: 0,
      spinner: 'crescent',
      cssClass: 'custom-loading',
      backdropDismiss: false,
      id : 'open-loading'
    });
    await loading.present();
    return loading;
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
      this.columnNames = lines[0].split(',').map((columnName, index) => {
        if (!columnName.trim()) {
          return `UndefinedColumnName`;
        }
        return columnName.trim();
      });
      if(this.columnNames.length < 2){
        this.presentMinColumnError();
      }
    }
  }

  //Alert for enter the name of review
  async presentReviewNameAlert() {
    const token = localStorage.getItem('token') || '';
    console.log(token)
    const alert = await this.alertController.create({
      header: 'Insert review name:',
      inputs: [
        {
          placeholder: 'Name',
          cssClass: 'alert-input',
          attributes: {
            maxlength: 20
          }
        },
      ],
      buttons: [
        {
          text: 'Analyzes',
          cssClass: 'alert-button-blue',
          handler: (input) => {
            this.reviewLabel = input[0] && input[0].trim() !== '' ? input[0].trim() : null;

            if (!this.reviewLabel) {
              const defaultBaseName = 'defaultNameReview';
              let counter = 1;

              while (this.reviews.some(review => review.name === `${defaultBaseName}${counter}`)) {
                counter++;
              }

              this.reviewLabel = `${defaultBaseName}${counter}`;
            }

            const reviewExists = this.reviews.some(review => review.name === this.reviewLabel);

            if (reviewExists) {
              this.presentExistingNameAlert();
            } else {
              this.uploadReview(this.reviewLabel, token);
            }
        },
        },
        {
          text: 'Cancel',
          cssClass: 'alert-button-red',
          handler: () =>{
            window.location.reload();
          }
        },
      ],
      backdropDismiss: false,
    });
  await alert.present();
  }

  async presentExistingNameAlert(){
    const alert = await this.alertController.create({
      header: 'A review with this name already exists',
      message: 'Insert a different name',
      buttons: [
        {
          text: 'Ok',
          cssClass: 'alert-button-blue',
          handler: () => {
            this.presentReviewNameAlert();
          }
        },
      ],
      backdropDismiss: false,
    })
    await alert.present()
  }

  //Alert if there are less of 2 columns
  async presentMinColumnError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'CSV has less of 2 columns!',
      buttons: [
        {
          text: 'Ok',
          cssClass: 'alert-button-blue',
          handler: () => {
          window.location.reload()
          }
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  //Send result to results page
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
          handler: () => {
            window.location.reload()
          }
        },
      ],
      backdropDismiss: false,
    });
  await alert.present();
  }

  //Alert for select analysis type
  async presentAnalysisSelectionAlert() {
    const alert = await this.alertController.create({
      header: 'Select the type of analysis:',
      inputs: [
        {
          name: 'BLEU',
          type: 'checkbox',
          label: 'BLEU',
          value: 'BLEU',
          checked: this.reviewModes.includes('BLEU')
        },
        {
          name: 'CodeBLEU',
          type: 'checkbox',
          label: 'CodeBLEU',
          value: 'CODEBLEU',
          checked: this.reviewModes.includes('CodeBLEU')
        },
        {
          name: 'CrystalBLEU',
          type: 'checkbox',
          label: 'CrystalBLEU',
          value: 'CRYSTALBLEU',
          checked: this.reviewModes.includes('CrystalBLEU')
        }
      ],
      buttons: [
        {
          text: 'Confirm',
          cssClass: 'alert-button-blue',
          handler: (selectedValues) => {
            this.reviewModes = selectedValues;
            console.log('Selected analysis modes:', this.reviewModes);
            if(this.reviewModes.length > 0){
              this.presentReviewNameAlert();
            }else{
              this.presentNoSelectionAlert();
            }
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-red',
          handler: () => {
            console.log('Selection cancelled');
            window.location.reload();
          }
        }
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  //If no analysis types is chosen
  async presentNoSelectionAlert() {
    const alert = await this.alertController.create({
      header: 'No Selection',
      message: 'Please select at least one analysis type.',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-blue',
          handler: () => {
            this.presentAnalysisSelectionAlert();
          }
        }
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  //If the file dropped is not a CSV file
  async presentNoCSVfile() {
    const alert = await this.alertController.create({
      header: 'The file is not a CSV',
      message: 'Please select a CSV file',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-blue',
          handler: () => {
            window.location.reload();
          }
        }
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  //Send file to backend with reviewService
  uploadReview(reviewLabel: string, token: string){
    if (!this.selectedFile || !this.selectedCandidateColumn || !this.selectedReferenceColumn){
      console.error('File or column not selected');
      return;
    }

    const review = new Review(this.selectedFile, reviewLabel, reviewLabel, new Date(), this.reviewModes, this.bleuScore, this.crystalBleuScore, this.codeBleuScore, this.selectedCandidateColumn, this.selectedReferenceColumn);

    this.analysisInProgress = true;

    this.presentLoading().then(loading => {
      this.reviewService.uploadReview(review, token).subscribe(response =>{
        console.log('Review uploaded succesfully:', response);
        this.presentConfirmationUploadAlert();
        this.resultsService.setResults(response);
        this.analysisInProgress = false;
        loading.dismiss();
      }, error => {
        console.error('Error during review upload:', error);
        this.analysisInProgress = false;
        loading.dismiss();
      });
    });
    console.log(review);
  }

  //Drag file
  onDragOver(event: DragEvent) {
    if (this.fileIsInsert) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
  }

  //Drop file
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
        this.presentNoCSVfile();
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
      this.isDragging = false;
    }
  }

  //Check if dropped file is a CSV
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

  navigateToLogin(){
    localStorage.removeItem('token');
    this.router.navigate(['/login'])
  }
}
