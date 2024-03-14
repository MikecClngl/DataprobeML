import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
      private alertController: AlertController,
      private http: HttpClient
      ){}

  selectedFile: File | undefined;
  fileIsInsert: boolean = false;
  fileName: string | undefined;
  fileType: string | undefined;
  reviewLabel: string | undefined;
  checkboxValues = {
    bleu: false,
    codebleu: false,
    crystalbleu: false
  };

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

  //Function to see if almost one checkbox is selected for activate button "submit"
  checkboxSelected(): boolean {
    return this.checkboxValues.bleu || this.checkboxValues.codebleu || this.checkboxValues.crystalbleu;
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
            this.uploadReviewFile(input[0]);
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

  //Reset the values
  resetValues() {
    this.fileIsInsert = false;
    this.selectedFile = undefined;
    this.fileName = undefined;
    this.fileType = undefined;
    this.reviewLabel = undefined;
    this.checkboxValues = {
      bleu: false,
      codebleu: false,
      crystalbleu: false
    };
  }

  getCSRFToken(){
    return this.http.get<any>('http://127.0.0.1:8000/get_csrf_token/');
  }

  //Send file and name of review to backend
  uploadReviewFile(reviewLabel: string) {

    if (!this.selectedFile) {
      console.error('No file selected');
      return;
      }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('reviewName', reviewLabel);

    this.getCSRFToken().pipe(
      tap((response => {
        const csrfToken = response.csrfToken;
        console.log(csrfToken)
        formData.append('csrfmiddlewaretoken', csrfToken);

        this.http.post<any>('http://127.0.0.1:8000/review/', formData)
        .pipe(
          tap((response) => {
            console.log('Risposta dal server:', response);
          }),
          catchError((error) => {
            console.error('Errore nella richiesta:', error);
           return of(null);
          })
        )
        .subscribe();
    })))
    }
}
