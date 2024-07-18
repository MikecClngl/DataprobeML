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


  uploadReview(review: Review): Observable<any> {
    const formData = new FormData();
    formData.append('review', review.file);
    formData.append('name', review.name);
    formData.append('description', review.name);
    formData.append('date', review.date.toISOString());
    formData.append('reviewModes', JSON.stringify(review.reviewModes));

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');

    return this.http.post<any>(this.apiUrl, formData, { headers });
  }
}
