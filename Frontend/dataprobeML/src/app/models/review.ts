export class Review {
  file: File;
  name: string;
  description: string ;
  date: Date;
  reviewModes: string[]|undefined;
  bleuScore: number = -1;
  crystalBleuScore: number = -1;
  codeBleuScore: number = -1

  constructor(file: File, name: string, description: string, date: Date, reviewModes: string[]|undefined, bleuScore: number, crystalBleuScore: number, codeBleuScore: number){
    this.file = file;
    this.name = name;
    this.description = description;
    this.date = date;
    this.reviewModes = reviewModes;
    this.bleuScore = bleuScore;
    this.crystalBleuScore = crystalBleuScore;
    this.codeBleuScore = codeBleuScore;
  }
}
