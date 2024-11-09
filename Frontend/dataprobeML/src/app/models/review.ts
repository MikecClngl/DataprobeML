export class Review {
  id?: number;
  file: File;
  name: string;
  description: string ;
  date: Date;
  reviewModes: string[]|undefined;
  bleuScore: number = -1;
  crystalBleuScore: number = -1;
  codeBleuScore: number = -1;
  rougeScore: number = -1;
  meteorScore: number = -1;
  candidateColumn: string;
  referenceColumn: string

  constructor(
    file: File,
    name: string,
    description: string,
    date: Date,
    reviewModes: string[]|undefined,
    bleuScore: number,
    crystalBleuScore: number,
    codeBleuScore: number,
    rougeScore: number,
    meteorScore: number,
    candidateColumn: string,
    referenceColumn: string,
    id?: number,
  ){

    this.id = id;
    this.file = file;
    this.name = name;
    this.description = description;
    this.date = date;
    this.reviewModes = reviewModes;
    this.bleuScore = bleuScore;
    this.crystalBleuScore = crystalBleuScore;
    this.codeBleuScore = codeBleuScore;
    this.rougeScore = rougeScore;
    this.meteorScore = meteorScore;
    this.candidateColumn = candidateColumn;
    this.referenceColumn = referenceColumn;
  }
}
