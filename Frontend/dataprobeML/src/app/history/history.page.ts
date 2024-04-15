import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  reviews: any[] = []; 
  httpSubscription!: Subscription; // Subscription to handle HTTP request

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(){
    this.httpSubscription = this.http.get<any[]>("http://127.0.0.1:8000/reviews/")
    .subscribe(
      data => {
        this.reviews = data;
        console.log(this.reviews); // Log the reviews array
      },
      error => {
        console.error('Error fetching reviews:', error);
      }
    );
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
