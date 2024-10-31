import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  username = ''
  password = ''
  errorMessage: string = ''
  email = ''

  constructor(
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
  ) { }

  ngOnInit() {
    this.titleService.setTitle("Register");
    const spans = document.querySelectorAll('.glowing span');
    spans.forEach(span => {
      (span as HTMLElement).style.setProperty('--x', Math.random().toString());
      (span as HTMLElement).style.setProperty('--y', Math.random().toString());
      (span as HTMLElement).style.setProperty('--delay', Math.random().toString());
      (span as HTMLElement).style.setProperty('--speed', Math.random().toString());
    });
  }

  async register() {
    try {
      const response = await this.authService.register(this.username, this.password, this.email).toPromise();
      if (response && response.message === 'User registered successfully') {
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Registration failed';
      }
    } catch (error) {
      this.errorMessage = 'Error during registration';
    }
  }

  navigateToLogin(){
    this.router.navigate(['/login']);
  }

}
