export class Review {
  file: File;
  name: string | undefined;
  description: string | undefined;
  date: Date;
  reviewModes: string|undefined;

  constructor(file: File, name: string|undefined, description: string|undefined, date: Date, reviewModes: string|undefined){
    this.file = file;
    this.name = name;
    this.description = description;
    this.date = date;
    this.reviewModes = reviewModes;
  }
}
