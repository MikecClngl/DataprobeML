import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Review } from '../models/review';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  reviews: Review[] = [];

  constructor(
    private router: Router,
    private reviewService: ReviewService,
  ) {}

  async ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.loadReview().subscribe(
      (data: Review[]) => {
        this.reviews = data;
        console.log('Revisioni caricate con successo:', this.reviews);
      },
      error => {
        console.error('Errore durante il caricamento delle recensioni:', error);
      }
    );
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
