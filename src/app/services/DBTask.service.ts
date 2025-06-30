import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DBTaskService {
  private dbInstance: SQLiteObject | null = null;

  private mockDatabase: { users: any[]; sessions: any[] } = {
    users: [{ id: 1, username: 'test@example.com', password: '123456' }],
    sessions: [],
  };

  constructor(private sqlite: SQLite) {}

  async setDatabase(): Promise<void> {
    if (this.isBrowser()) {
      console.log('Usando IndexedDB en el navegador.');
      this.dbInstance = null; 
    } else {
      try {
        const db = await this.sqlite.create({
          name: 'app.db',
          location: 'default',
        });
        this.dbInstance = db;
        console.log('Base de datos inicializada correctamente.');
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
      }
    }
  }

  private isBrowser(): boolean {
    return !document.URL.startsWith('file://');
  }

  async createTables(): Promise<void> {
    if (!this.dbInstance) {
      console.error('La instancia de la base de datos no está inicializada.');
      return;
    }

    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        active INTEGER NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      )`
    ];

    try {
      for (const query of queries) {
        await this.dbInstance.executeSql(query, []);
      }
      console.log('Tablas creadas correctamente.');
    } catch (error) {
      console.error('Error al crear las tablas:', error);
    }
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    if (this.isBrowser()) {
      const user = this.mockDatabase.users.find(
        (u) => u.username === username && u.password === password
      );
      return !!user;
    } else {
      if (!this.dbInstance) {
        throw new Error('La instancia de la base de datos no está inicializada.');
      }

      const query = `SELECT * FROM users WHERE username = ? AND password = ? LIMIT 1`;
      try {
        const result = await this.dbInstance.executeSql(query, [username, password]);
        console.log('Resultado de validación:', result.rows);
        if (result.rows.length > 0) {
          console.log('Usuario encontrado:', result.rows.item(0));
          return true;
        } else {
          console.log('No se encontró un usuario con las credenciales proporcionadas.');
          return false;
        }
      } catch (error) {
        console.error('Error al validar el usuario:', error);
        return false;
      }
    }
  }

  async registerSession(userId: number): Promise<void> {
    if (this.isBrowser()) {
      this.mockDatabase.sessions.push({ id: Date.now(), userId, active: 1 });
      console.log('Sesión registrada correctamente en el navegador.');
    } else {
      if (!this.dbInstance) {
        throw new Error('La instancia de la base de datos no está inicializada.');
      }

      const query = `INSERT INTO sessions (userId, active) VALUES (?, 1)`;
      try {
        await this.dbInstance.executeSql(query, [userId]);
        console.log('Sesión registrada correctamente para el usuario con ID:', userId);
      } catch (error) {
        console.error('Error al registrar la sesión:', error);
      }
    }
  }

  async updateSessionStatus(sessionId: number, active: number): Promise<void> {
    if (!this.dbInstance) {
      throw new Error('La instancia de la base de datos no está inicializada.');
    }

    const query = `UPDATE sessions SET active = ? WHERE id = ?`;
    try {
      await this.dbInstance.executeSql(query, [active, sessionId]);
      console.log(`Estado de la sesión actualizado correctamente. ID de sesión: ${sessionId}, Activo: ${active}`);
    } catch (error) {
      console.error('Error al actualizar el estado de la sesión:', error);
    }
  }

  async executeQuery(query: string, params: any[] = []): Promise<any> {
    if (!this.dbInstance) {
      throw new Error('La instancia de la base de datos no está inicializada.');
    }

    try {
      const result = await this.dbInstance.executeSql(query, params);
      return result;
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      throw error;
    }
  }

  async listUsers(): Promise<void> {
    if (!this.dbInstance) {
      throw new Error('La instancia de la base de datos no está inicializada.');
    }

    const query = `SELECT * FROM users`;
    try {
      const result = await this.dbInstance.executeSql(query, []);
      console.log('Usuarios:', result.rows);
      for (let i = 0; i < result.rows.length; i++) {
        console.log(result.rows.item(i));
      }
    } catch (error) {
      console.error('Error al listar los usuarios:', error);
    }
  }

  async listSessions(): Promise<void> {
    if (!this.dbInstance) {
      throw new Error('La instancia de la base de datos no está inicializada.');
    }

    const query = `SELECT * FROM sessions`;
    try {
      const result = await this.dbInstance.executeSql(query, []);
      console.log('Sesiones:', result.rows);
      for (let i = 0; i < result.rows.length; i++) {
        console.log(result.rows.item(i));
      }
    } catch (error) {
      console.error('Error al listar las sesiones:', error);
    }
  }
}