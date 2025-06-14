import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudAuditoria } from '../../models/crud.model';
import { AuditoriaService } from '../../services/auditoria.service';
import { Timestamp, FieldValue } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auditoria-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud.html',
})
export class AuditoriaListComponent implements OnInit {
  auditoriaEntries: CrudAuditoria[] = [];
  loading = true;
  error: string | null = null;

  // Parámetros de ordenamiento
  ordenarPor: string = 'fechaRegistroServidor';
  direccionOrdenamiento: 'asc' | 'desc' = 'desc';

  // Parámetros de filtro/búsqueda
  filtroFecha: string = '';
  busquedaEmail: string = '';
  filtroMetodo: string = '';
  
  // Autocompletado de emails
  usuariosRegistrados: {email: string, name: string}[] = [];
  filteredEmails: {email: string, name: string}[] = [];
  
  // Métodos de autenticación
  metodosAutenticacion: string[] = [];

  constructor(private auditoriaService: AuditoriaService) { }

  ngOnInit(): void {
    this.cargarAuditoria();
    this.cargarUsuariosRegistrados();
    this.cargarMetodosAutenticacion();
  }

  cargarUsuariosRegistrados(): void {
    this.auditoriaService.getUsuariosRegistrados().subscribe({
      next: (users) => {
        this.usuariosRegistrados = users;
        this.filteredEmails = [...users];
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  cargarMetodosAutenticacion(): void {
    this.auditoriaService.getMetodosAutenticacion().subscribe({
      next: (metodos) => {
        this.metodosAutenticacion = metodos;
      },
      error: (err) => console.error('Error cargando métodos:', err)
    });
  }

  filtrarEmails(search: string): void {
    if (!search) {
      this.filteredEmails = [...this.usuariosRegistrados];
      return;
    }
    const searchLower = search.toLowerCase();
    this.filteredEmails = this.usuariosRegistrados.filter(user => 
      user.email.toLowerCase().includes(searchLower) || 
      (user.name && user.name.toLowerCase().includes(searchLower))
    );
  }

  cargarAuditoria(): void {
    this.loading = true;
    this.error = null;

    let observable: Observable<CrudAuditoria[]>;

    if (this.filtroFecha) {
      const localDate = this.convertStringToLocalDate(this.filtroFecha);
      observable = this.auditoriaService.getAuditoriaPorFecha(
        localDate,
        this.ordenarPor,
        this.direccionOrdenamiento
      );
    }
    else if (this.busquedaEmail) {
      observable = this.auditoriaService.getAuditoriaParcialEmailFrontend(
        this.busquedaEmail,
        this.ordenarPor,
        this.direccionOrdenamiento
      );
    }
    else {
      observable = this.auditoriaService.getTodasEntradasAuditoria(
        this.ordenarPor,
        this.direccionOrdenamiento,
        this.filtroMetodo || undefined
      );
    }

    observable.subscribe({
      next: (data) => {
        this.auditoriaEntries = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los registros:', err);
        this.error = 'Error al cargar los registros. Verifica la consola para detalles.';
        this.loading = false;
      }
    });
  }

  private convertStringToLocalDate(dateString: string): { year: number, month: number, day: number, toString(): string } {
    const [year, month, day] = dateString.split('-').map(Number);
    return {
      year,
      month,
      day,
      toString: () => dateString
    };
  }

  aplicarFiltros(): void {
    this.cargarAuditoria();
  }

  limpiarFiltros(): void {
    this.filtroFecha = '';
    this.busquedaEmail = '';
    this.filtroMetodo = '';
    this.ordenarPor = 'fechaRegistroServidor';
    this.direccionOrdenamiento = 'desc';
    this.cargarAuditoria();
  }

  ordenarPorColumna(columna: string): void {
    if (this.ordenarPor === columna) {
      this.direccionOrdenamiento = this.direccionOrdenamiento === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenarPor = columna;
      this.direccionOrdenamiento = 'asc';
    }
    this.cargarAuditoria();
  }

  formatoFechaHora(fechaTimestamp: FieldValue | Timestamp | undefined): string {
    if (!fechaTimestamp) {
        return 'N/A';
    }
    if (fechaTimestamp instanceof Timestamp) {
        try {
            const date = fechaTimestamp.toDate();
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            return date.toLocaleString('es-ES', options);
        } catch (e) {
            console.error("Error formateando fecha:", e);
            return 'Fecha inválida';
        }
    } else {
        return 'Pendiente...';
    }
  }
}