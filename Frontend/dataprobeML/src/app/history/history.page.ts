import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  historyData: { reviewName: string, time: string }[] = [];

  constructor(
    private router: Router
  ) {
    this.historyData = [
      {reviewName: 'ArrayReview', time: '10:00'},
      {reviewName: 'ArrayReview2', time: '18:00'},
      {reviewName: 'ArrayReview3', time: '20:00'},
    ];
  }

  ngOnInit() {
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
