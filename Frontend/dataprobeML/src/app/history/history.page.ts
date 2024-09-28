import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Review } from '../models/review';
import { ReviewService } from '../services/review.service';
import { Title } from '@angular/platform-browser';

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
    private title: Title
  ) {
    title.setTitle("DataprobeML - History");
  }

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
        console.error('Errore durante il caricamento delle revisioni:', error);
      }
    );
  }

  viewResults(review: any) {
    this.router.navigate(['/results'], { state: { review } });
  }

    // function to delete a review
    deleteReview(reviewId: number) {
      this.reviewService.deleteReview(reviewId).subscribe(
        response => {
          console.log('Review deleted succesfully', response);
          window.location.reload()
        },
        error => {
          console.error('Error, review not deleted', error);
        }
      );
    }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
