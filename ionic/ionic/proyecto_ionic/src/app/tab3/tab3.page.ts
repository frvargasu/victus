import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  showRegister = false;
  isLoggedIn = false;
  loginData = { email: '', password: '' };
  registerData = { email: '', password: '' };

  constructor() {}

  login() {
    // Simula inicio de sesión exitoso
    this.isLoggedIn = true;
    this.showRegister = false;
  }

  register() {
    // Simula registro exitoso
    this.isLoggedIn = true;
    this.showRegister = false;
  }

  logout() {
    this.isLoggedIn = false;
    this.loginData = { email: '', password: '' };
    this.registerData = { email: '', password: '' };
  }
}