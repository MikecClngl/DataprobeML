import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  fileIsInsert: boolean = false;
  fileName: string | undefined;
  fileType: string | undefined;
  checkboxValues = {
    bleu: false,
    codebleu: false,
    crystalbleu: false
  };

  //Function to manage file uploading
  handleFileInput(event: any){
    const file = event.target.files[0];

    if (file) {
      this.fileIsInsert = true;
      this.fileName = file.name;
      this.fileType = file.type;
    }
  }

  //Function to see if almost one checkbox is selected for button "submit"
  checkboxSelected(): boolean {
    return this.checkboxValues.bleu || this.checkboxValues.codebleu || this.checkboxValues.crystalbleu;
  }
}
