import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit{

  username = ''
  password=''
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
  ) { }

  ngOnInit(){
    this.titleService.setTitle("Login");
    const spans = document.querySelectorAll('.glowing span');
    spans.forEach(span => {
      (span as HTMLElement).style.setProperty('--x', Math.random().toString());
      (span as HTMLElement).style.setProperty('--y', Math.random().toString());
      (span as HTMLElement).style.setProperty('--delay', Math.random().toString());
      (span as HTMLElement).style.setProperty('--speed', Math.random().toString());
    });
  }

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

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
