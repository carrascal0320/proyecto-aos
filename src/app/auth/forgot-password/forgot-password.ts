import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
})
export class ForgotPasswordComponent {
  authService = inject(AuthService);
  router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  successMessage = '';
  errorMessage = '';

  onSubmit() {
    if (this.form.valid) {
      const email = this.form.value.email!;
      this.authService.sendPasswordReset(email)
        .then(() => {
          this.successMessage = 'Correo de recuperación enviado. Revisa tu bandeja de entrada.';
          this.errorMessage = '';
        })
        .catch(err => {
          this.errorMessage = 'Hubo un error al enviar el correo. Asegúrate que el correo esté registrado.';
          this.successMessage = '';
        });
    }
  }
}
