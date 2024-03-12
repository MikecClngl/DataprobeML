import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
      private alertController: AlertController){}

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
            console.log(this.reviewLabel);
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
}
