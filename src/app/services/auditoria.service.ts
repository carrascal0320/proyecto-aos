import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  FieldValue,
  serverTimestamp,
  CollectionReference
} from '@angular/fire/firestore';
import { CrudAuditoria } from '../models/crud.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private auditoriaCollection: CollectionReference<CrudAuditoria>;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.auditoriaCollection = collection(this.firestore, 'auditoria') as CollectionReference<CrudAuditoria>;
  }

  registrarAutenticacion(email: string, name: string | null = null, phone: string | null = null, metodoAutenticacion: string): Observable<string> {
    const auditoriaData: Partial<CrudAuditoria> = {
      email: email,
      metodoAutenticacion: metodoAutenticacion,
      fechaRegistroServidor: serverTimestamp()
    };

    if (name !== null) {
      auditoriaData.name = name;
    }
    if (phone !== null) {
      auditoriaData.phone = phone;
    }

    return from(addDoc(this.auditoriaCollection, auditoriaData as CrudAuditoria)).pipe(
      map(docRef => docRef.id)
    );
  }

  getTodasEntradasAuditoria(
  ordenarPor: string = 'fechaRegistroServidor', 
  direccionOrdenamiento: 'asc' | 'desc' = 'desc',
  metodoAutenticacion?: string
): Observable<CrudAuditoria[]> {
  let q;
  
  if (metodoAutenticacion) {
    // Consulta con filtro por método y ordenamiento
    q = query(
      this.auditoriaCollection,
      where('metodoAutenticacion', '==', metodoAutenticacion),
      orderBy(ordenarPor, direccionOrdenamiento)
    );
  } else {
    // Consulta solo con ordenamiento
    q = query(
      this.auditoriaCollection, 
      orderBy(ordenarPor, direccionOrdenamiento)
    );
  }
  
  return from(getDocs(q)).pipe(
    map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CrudAuditoria })))
  );
}

  getAuditoriaPorFecha(fecha: SimpleDate, ordenarPor: string = 'fechaRegistroServidor', direccionOrdenamiento: 'asc' | 'desc' = 'desc'): Observable<CrudAuditoria[]> {
    const startOfDay = Timestamp.fromDate(new Date(fecha.toString() + 'T00:00:00Z'));
    const endOfDay = Timestamp.fromDate(new Date(fecha.toString() + 'T23:59:59.999Z'));

    const q = query(
      this.auditoriaCollection,
      where('fechaRegistroServidor', '>=', startOfDay),
      where('fechaRegistroServidor', '<=', endOfDay),
      orderBy(ordenarPor, direccionOrdenamiento)
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CrudAuditoria })))
    );
  }

  getAuditoriaPorEmail(email: string, ordenarPor: string = 'fechaRegistroServidor', direccionOrdenamiento: 'asc' | 'desc' = 'desc'): Observable<CrudAuditoria[]> {
    const q = query(
      this.auditoriaCollection,
      where('email', '==', email),
      orderBy(ordenarPor, direccionOrdenamiento)
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CrudAuditoria })))
    );
  }

  getAuditoriaPorEmailYFecha(email: string, fecha: SimpleDate, ordenarPor: string = 'fechaRegistroServidor', direccionOrdenamiento: 'asc' | 'desc' = 'desc'): Observable<CrudAuditoria[]> {
    const startOfDay = Timestamp.fromDate(new Date(fecha.toString() + 'T00:00:00Z'));
    const endOfDay = Timestamp.fromDate(new Date(fecha.toString() + 'T23:59:59.999Z'));

    const q = query(
      this.auditoriaCollection,
      where('email', '==', email),
      where('fechaRegistroServidor', '>=', startOfDay),
      where('fechaRegistroServidor', '<=', endOfDay),
      orderBy(ordenarPor, direccionOrdenamiento)
    );
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as CrudAuditoria })))
    );
  }

  getAuditoriaParcialEmailFrontend(emailPartial: string, ordenarPor: string = 'fechaRegistroServidor', direccionOrdenamiento: 'asc' | 'desc' = 'desc'): Observable<CrudAuditoria[]> {
    return this.getTodasEntradasAuditoria(ordenarPor, direccionOrdenamiento).pipe(
      map(entries => {
        if (!emailPartial) {
          return entries;
        }
        const lowerCaseEmailPartial = emailPartial.toLowerCase();
        return entries.filter(entry => 
          entry.email.toLowerCase().includes(lowerCaseEmailPartial) ||
          (entry.name && entry.name.toLowerCase().includes(lowerCaseEmailPartial))
        );
      })
    );
  }

  getUsuariosRegistrados(): Observable<{email: string, name: string}[]> {
    const q = query(this.auditoriaCollection);
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const usersMap = new Map<string, {email: string, name: string}>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!usersMap.has(data.email)) {
            usersMap.set(data.email, {
              email: data.email,
              name: data.name || 'Sin nombre'
            });
          }
        });
        return Array.from(usersMap.values());
      })
    );
  }

  getMetodosAutenticacion(): Observable<string[]> {
    const q = query(this.auditoriaCollection);
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const metodos = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.metodoAutenticacion) {
            metodos.add(data.metodoAutenticacion);
          }
        });
        return Array.from(metodos);
      })
    );
  }
}

type SimpleDate = { 
  year: number; 
  month: number; 
  day: number; 
  toString(): string 
};