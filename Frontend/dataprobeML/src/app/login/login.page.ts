import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage{

  username = ''
  password=''
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  async login() {
    try {
      const response = await this.authService.login(this.username, this.password).toPromise();
      if (response?.token) {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Token not received';
      }
    } catch (error) {
      this.errorMessage = 'No valid credential';
    }
  }
}
