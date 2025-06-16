import { Component, OnInit } from '@angular/core';
import { DBTaskService } from '../services/dbtask.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  showRegister = false;
  isLoggedIn = false;
  loginData = { email: '', password: '' };
  registerData = { email: '', password: '' };

  constructor(private dbTaskService: DBTaskService) {}

  async ngOnInit() {
    try {
      await this.dbTaskService.setDatabase();
      await this.dbTaskService.createTables();
      await this.dbTaskService.listUsers(); // Verifica los usuarios registrados
      await this.dbTaskService.listSessions(); // Verifica las sesiones registradas
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async login() {
    try {
      const isValidUser = await this.dbTaskService.validateUser(this.loginData.email, this.loginData.password);
      if (isValidUser) {
        console.log('Login successful!');
        const userId = await this.getUserId(this.loginData.email);
        await this.dbTaskService.registerSession(userId);
        this.isLoggedIn = true;
        this.showRegister = false;
      } else {
        console.log('Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  async register() {
    try {
      const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
      await this.dbTaskService.executeQuery(query, [this.registerData.email, this.registerData.password]);

      console.log('User registered successfully!');
      const userId = await this.getUserId(this.registerData.email);
      await this.dbTaskService.registerSession(userId);
      this.isLoggedIn = true;
      this.showRegister = false;
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }

  async logout() {
    try {
      const sessionId = await this.getActiveSessionId();
      await this.dbTaskService.updateSessionStatus(sessionId, 0);
      this.isLoggedIn = false;
      this.loginData = { email: '', password: '' };
      this.registerData = { email: '', password: '' };
      console.log('Logout successful!');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  private async getUserId(email: string): Promise<number> {
    const query = `SELECT id FROM users WHERE username = ? LIMIT 1`;
    const result = await this.dbTaskService.executeQuery(query, [email]);
    if (result?.rows.length > 0) {
      return result.rows.item(0).id;
    } else {
      throw new Error('User not found');
    }
  }

  private async getActiveSessionId(): Promise<number> {
    const query = `SELECT id FROM sessions WHERE active = 1 LIMIT 1`;
    const result = await this.dbTaskService.executeQuery(query, []);
    if (result?.rows.length > 0) {
      return result.rows.item(0).id;
    } else {
      throw new Error('No active session found');
    }
  }
}