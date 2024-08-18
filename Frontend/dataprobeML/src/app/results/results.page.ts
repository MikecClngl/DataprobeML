import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';

import { ResultsService } from '../services/results.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {
  results : any

  constructor(
    private router: Router,
    private resultsService : ResultsService
  ) { }

  ngOnInit() {
    //this.results = this.resultsService.getResults();
    this.results = {
      bleuScores: 10,          // Example BLEU Score
      crystalBleuScores: 50,   // Example CrystalBLEU Score
      codeBleuScores: 90       // Example CodeBLEU Score
    };
  }

  navigateToHome(){
    this.router.navigate(['/home'])
    window.location.reload
  }
}
