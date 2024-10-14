import { Component } from '@angular/core';
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
export class HomePage {

  constructor(
      private alertController: AlertController,
      private http: HttpClient,
      private router: Router,
      private reviewService : ReviewService,
      private resultsService : ResultsService,
      private titleService : Title,
      private loadingController: LoadingController
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

  reviewLabel: string = "";
  reviewModes: string[] = [];
  bleuScore: number = -1;
  crystalBleuScore: number = -1;
  codeBleuScore: number = -1;

  isDragging: boolean = false;
  analysisInProgress: boolean = false;

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
          text: 'Analyzes',
          cssClass: 'alert-button-blue',
          handler: (input) => {
            this.reviewLabel = input[0] && input[0].trim() !== '' ? input[0] : 'defaultNameReview';
            this.uploadReview(this.reviewLabel);
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

  //alert for select analysis type
  async presentAnalysisSelectionAlert() {
    const alert = await this.alertController.create({
      header: 'SELECT THE TYPE OF ANALYSIS',
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
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Selection cancelled');
            window.location.reload();
          }
        },
        {
          text: 'Confirm',
          handler: (selectedValues) => {
            this.reviewModes = selectedValues;
            console.log('Selected analysis modes:', this.reviewModes);
            if(this.reviewModes.length > 0){
              this.presentReviewNameAlert();
            }else{
              this.presentNoSelectionAlert();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async presentNoSelectionAlert() {
    const alert = await this.alertController.create({
      header: 'No Selection',
      message: 'Please select at least one analysis type.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.presentAnalysisSelectionAlert();
          }
        }
      ]
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

    this.analysisInProgress = true;

    this.presentLoading().then(loading => {
      this.reviewService.uploadReview(review).subscribe(response =>{
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
