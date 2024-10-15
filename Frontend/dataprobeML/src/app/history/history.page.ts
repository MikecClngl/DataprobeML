import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Review } from '../models/review';
import { ReviewService } from '../services/review.service';
import { Title } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  reviews: Review[] = [];
  sortField: string = '';
  sortDirection: string = 'asc';
  searchTerm: string = '';
  searchDate: string = '';
  filteredReviews: Review[] = [];

  constructor(
    private router: Router,
    private reviewService: ReviewService,
    private title: Title,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.title.setTitle("DataprobeML - History")
    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.loadReview().subscribe(
      (data: Review[]) => {
        this.reviews = data;
        this.filteredReviews = this.reviews;
        console.log('Revisioni caricate con successo:', this.reviews);
      },
      error => {
        console.error('Errore durante il caricamento delle revisioni:', error);
      }
    );
  }

  //filter reviews by search name or date
  filterReviews() {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    const datePattern = /\b\d{2}\/\d{2}\/\d{4}\b/;
    const match = searchTermLower.match(datePattern);

    let searchDate = '';
    if (match) {
      searchDate = match[0];
    }

    this.filteredReviews = this.reviews.filter(review => {
      const reviewDate = new Date(review.date).toLocaleDateString('en-GB');

      const matchesName = review.name.toLowerCase().includes(searchTermLower.replace(searchDate, '').trim());
      const matchesDate = searchDate ? reviewDate === searchDate : true;

      return matchesName && matchesDate;
    });
  }

  //view results of a review
  viewResults(review: any) {
    this.router.navigate(['/results'], { state: { review } });
  }

  // function to delete a review
  deleteReview(reviewId: number) {
    this.reviewService.deleteReview(reviewId).subscribe(
      response => {
        console.log('Review deleted succesfully', response);
        this.deletedAlertConfirm();
      },
      error => {
        console.error('Error, review not deleted', error);
      }
    );
  }

  //function to sort by name or date
  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredReviews.sort((a, b) => {
      let comparison = 0;
      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateA - dateB;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  //deletion confirm
  async deletedAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Review Deleted',
      message: 'The review has been successfully deleted.',
      buttons: [{
        text: 'OK',
        cssClass: 'alert-button-blue',
        handler: () => {
          window.location.reload()
        }
      }]
    });

    await alert.present();
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
