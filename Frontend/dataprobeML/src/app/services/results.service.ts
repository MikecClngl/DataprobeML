import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private results : any

  constructor() { }

  setResults(results: any){
    this.results = results;
  }

  getResults(){
    return this.results
  }
}
