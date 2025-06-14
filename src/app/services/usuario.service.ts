import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { User } from '../interfaces/user.interface'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  constructor(private firestore: Firestore) {}

  getUsuarios(): Observable<User[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    return collectionData(usuariosRef, { idField: 'id' }) as Observable<User[]>;
  }


  agregarUsuario(usuario: User) {
    const usuariosRef = collection(this.firestore, 'usuarios');
    return addDoc(usuariosRef, usuario);
  }


  eliminarUsuario(id: string) {
    const usuarioDoc = doc(this.firestore, `usuarios/${id}`);
    return deleteDoc(usuarioDoc);
  }


  actualizarUsuario(id: string, usuario: Partial<User>) {
    const usuarioDoc = doc(this.firestore, `usuarios/${id}`);
    return updateDoc(usuarioDoc, usuario);
  }
}
