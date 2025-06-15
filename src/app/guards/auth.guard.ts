import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const isLoggedIn = !!localStorage.getItem('user'); // Verifica si hay un usuario autenticado
    if (!isLoggedIn) {
      // Redirige al login y almacena la URL a la que intentaba acceder
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Opcional: Verificar roles o permisos si es necesario
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (route.data['roles'] && !route.data['roles'].includes(user.role)) {
      // Si el usuario no tiene el rol requerido, redirige a una página de acceso denegado
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true; // Permite el acceso si está autenticado y cumple con los roles requeridos
  }
}