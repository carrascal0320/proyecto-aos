import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from './services/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})

export class AuthGuard implements CanActivate {
    
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      
      Swal.fire({
        icon: 'warning',
        title: 'Acceso restringido',
        text: 'Debes iniciar sesión para acceder a esta página.',
        confirmButtonColor: '#6B46C1',
      }).then(() => {
       
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      });

      return false;
    }
    return true;
  }
  
}