import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Review } from '../models/review';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://127.0.0.1:8000/reviews/'

  constructor(
    private http: HttpClient
  ) {}

  //post api to send review to backend
  uploadReview(review: Review): Observable<any> {
    const formData = new FormData();
    formData.append('review', review.file);
    formData.append('name', review.name);
    formData.append('description', review.name);
    formData.append('date', review.date.toISOString());
    formData.append('reviewModes', JSON.stringify(review.reviewModes));
    formData.append('candidateColumn', review.candidateColumn);
    formData.append('referenceColumn', review.referenceColumn);

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');

    return this.http.post<any>(this.apiUrl, formData, { headers });
  }
  //get api to get the saved reviews
  loadReview(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  //delete api for delete a review
  deleteReview(reviewId: number): Observable<any> {
    const url = `${this.apiUrl}${reviewId}`;
    return this.http.delete<any>(url);
  }
}
