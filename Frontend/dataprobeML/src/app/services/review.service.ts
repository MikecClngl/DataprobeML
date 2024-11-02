import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Review } from '../models/review';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://127.0.0.1:8000/reviews/'

  constructor(
    private http: HttpClient,
  ) {}

  //post api to send review to backend
  uploadReview(review: Review, token: string): Observable<any> {
    const formData = new FormData();
    formData.append('review', review.file);
    formData.append('name', review.name);
    formData.append('description', review.name);
    formData.append('date', review.date.toISOString());
    formData.append('reviewModes', JSON.stringify(review.reviewModes));
    formData.append('candidateColumn', review.candidateColumn);
    formData.append('referenceColumn', review.referenceColumn);

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Token ${token}`
    });

    return this.http.post<any>(this.apiUrl, formData, { headers });
  }
  //get api to get the saved reviews
  loadReview(token: string): Observable<Review[]> {
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    return this.http.get<Review[]>(this.apiUrl, { headers });
  }

  //delete api for delete a review
  deleteReview(reviewId: number, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    const url = `${this.apiUrl}${reviewId}`;
    return this.http.delete<any>(url, {headers});
  }

  updateReviewName(reviewId: number, reviewLabel: string): void {
    const url = `${this.apiUrl}${reviewId}`;
    const body = {
      id: reviewId,
      name: reviewLabel
    };

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found');
      return;
    }

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Token ${token}`);

    console.log('Sending PUT request to:', url);
    console.log('Body:', body);

    this.http.put<any>(url, body, { headers }).subscribe(
      (response) => {
        console.log('PUT Success:', response);
      },
      (error) => {
        console.error('PUT Error:', error);
      }
    );
  }
}
