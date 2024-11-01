import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
  ) { }

  private apiUrl = 'http://127.0.0.1:8000'

  login(username: string, password: string): Observable<{ token: string, username: string }> {
    return this.http.post<{ token: string, username: string }>(`${this.apiUrl}/login/`, { username, password });
  }

  register(username: string, password: string, email: string): Observable<{ message: string } | { error: string }> {
    return this.http.post<{ message: string } | { error: string }>(`${this.apiUrl}/register/`, { username, password, email });
  }
}

