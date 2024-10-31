import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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
  ) { }

  ngOnInit() {
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

}
