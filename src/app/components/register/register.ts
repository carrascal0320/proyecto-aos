import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../interfaces/user.interface';
import Swal from 'sweetalert2'; // ¡Importar SweetAlert2!


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ] as const,
  templateUrl: './register.html',
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    nombre: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.pattern('^[0-9]{7,15}$')])
  });

  // errorMessage: string | null = null; // Ya no es necesario

  onSubmit() {
    // this.errorMessage = null; // Ya no es necesario
    if (this.form.valid) {
      this.authService.register(this.form.value as User)
        .subscribe({
          next: () => {
            console.log('Usuario registrado exitosamente');
            Swal.fire({
              icon: 'success',
              title: '¡Registro Exitoso!',
              text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
              showConfirmButton: false,
              timer: 2000,
              customClass: {
                popup: 'rounded-xl shadow-lg',
                title: 'text-green-700',
                confirmButton: 'bg-green-600 hover:bg-green-700'
              }
            }).then(() => {
              this.router.navigate(['/login']);
            });
          },
          error: (error: any) => {
            console.error('Error en registro:', error);
            let errorMessage = 'Error al registrar el usuario. Por favor, inténtalo de nuevo.';
            if (error.code === 'auth/email-already-in-use') {
              errorMessage = 'El correo electrónico ya está en uso. Por favor, utiliza otro.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña es demasiado débil. Necesita ser más fuerte.';
            }
            Swal.fire({
              icon: 'error',
              title: 'Error de Registro',
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
        text: 'Por favor, completa todos los campos correctamente.',
        customClass: {
          popup: 'rounded-xl shadow-lg',
          title: 'text-yellow-700',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700'
        }
      });
    }
  }
}
