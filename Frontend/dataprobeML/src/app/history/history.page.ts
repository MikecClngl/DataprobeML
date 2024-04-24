import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  reviews: any[] = [];

  constructor(
    private router: Router,
  ) {}

  async ngOnInit() {
    try {
      const response = await fetch("http://127.0.0.1:8000/reviews/");
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      this.reviews = data;
      console.log(this.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
