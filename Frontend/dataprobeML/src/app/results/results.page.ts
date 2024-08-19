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
    this.results = this.resultsService.getResults();
  }

  navigateToHome(){
    this.router.navigate(['/home'])
    window.location.reload
  }
}
