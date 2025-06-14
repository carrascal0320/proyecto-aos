import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule
  ] as const,
  templateUrl: './login.html',

})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  // errorMessage: string | null = null; // Ya no es necesario si solo usas SweetAlert2 para errores

  onSubmit() {
    // this.errorMessage = null; // Ya no es necesario
    if (this.form.valid) {
      this.authService.logIn(this.form.value as User)
        .subscribe({
          next: resp => {
            console.log('Login exitoso:', resp);
            Swal.fire({
              icon: 'success',
              title: '¡Inicio de Sesión Exitoso!',
              text: 'Bienvenido de nuevo.',
              showConfirmButton: false,
              timer: 1500, // Duración del alert
              customClass: {
                popup: 'rounded-xl shadow-lg',
                title: 'text-green-700',
                confirmButton: 'bg-green-600 hover:bg-green-700'
              }
            }).then(() => {
              this.router.navigate(['/auditoria']);
            });
          },
          error: (error: any) => {
            console.error('Error en login personalizado:', error);
            let errorMessage = 'Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo.';
            if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
              errorMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
            } else if (error.code === 'auth/too-many-requests') {
              errorMessage = 'Demasiados intentos fallidos. Inténtalo de nuevo más tarde.';
            }
            Swal.fire({
              icon: 'error',
              title: 'Error de Inicio de Sesión',
              text: errorMessage,
              customClass: {
                popup: 'rounded-xl shadow-lg',
                title: 'text-red-700',
                confirmButton: 'bg-red-600 hover:bg-red-700'
              }
            });
          }
        });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor, introduce un email y contraseña válidos.',
        customClass: {
          popup: 'rounded-xl shadow-lg',
          title: 'text-yellow-700',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700'
        }
      });
    }
  }

  onClickGoogle() {
    this.authService.logInGoogle()
      .subscribe({
        next: resp => {
          console.log('Login con Google exitoso:', resp);
          Swal.fire({
            icon: 'success',
            title: '¡Inicio de Sesión Exitoso!',
            text: 'Bienvenido con Google.',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
              popup: 'rounded-xl shadow-lg',
              title: 'text-green-700',
              confirmButton: 'bg-green-600 hover:bg-green-700'
            }
          }).then(() => {
            this.router.navigate(['/auditoria']);
          });
        },
        error: (error: any) => {
          console.error('Error en login con Google:', error);
          let errorMessage = 'Error al iniciar sesión con Google.';
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'El popup de Google fue cerrado.';
          }
          Swal.fire({
            icon: 'error',
            title: 'Error de Inicio de Sesión',
            text: errorMessage,
            customClass: {
              popup: 'rounded-xl shadow-lg',
              title: 'text-red-700',
              confirmButton: 'bg-red-600 hover:bg-red-700'
            }
          });
        }
      });
  }


  onClickFacebook(): void {
  Swal.fire({
    title: 'Iniciando sesión con Facebook',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.authService.logInFacebook().subscribe({
    next: (resp) => {
      Swal.close();
      // Manejo exitoso
    },
    error: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error de Facebook',
        text: error.message,
        footer: 'Verifica que los popups estén habilitados para este sitio'
      });
    }
  });
}

  onClicklogInGitHub() {
    // this.errorMessage = null; // Ya no es necesario
    this.authService.logInGitHub()
      .subscribe({
        next: resp => {
          console.log('Login con GitHub exitoso:', resp);
          Swal.fire({
            icon: 'success',
            title: '¡Inicio de Sesión Exitoso!',
            text: 'Bienvenido con GitHub.',
            showConfirmButton: false,
            timer: 1500,
            customClass: {
              popup: 'rounded-xl shadow-lg',
              title: 'text-green-700',
              confirmButton: 'bg-green-600 hover:bg-green-700'
            }
          }).then(() => {
            this.router.navigate(['/auditoria']);
          });
        },
        error: (error: any) => {
          console.error('Error en login con GitHub:', error);
          let errorMessage = 'Error al iniciar sesión con GitHub.';
          if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'El popup de GitHub fue cerrado.';
          }
          Swal.fire({
            icon: 'error',
            title: 'Error de Inicio de Sesión',
            text: errorMessage,
            customClass: {
              popup: 'rounded-xl shadow-lg',
              title: 'text-red-700',
              confirmButton: 'bg-red-600 hover:bg-red-700'
            }
          });
        }
      });
  }
}
