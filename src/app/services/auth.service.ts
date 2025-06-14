import { Injectable, inject } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  sendPasswordResetEmail,
  GithubAuthProvider,
  UserCredential,
  User as FirebaseAuthUser
} from 'firebase/auth';
import { Auth } from '@angular/fire/auth'; 
import { User } from '../interfaces/user.interface'; 
import { AuditoriaService } from './auditoria.service';
import { Observable, from, of } from 'rxjs'; 
import { map, catchError, switchMap, tap } from 'rxjs/operators'; 

import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth); 
  private auditoriaService = inject(AuditoriaService);
  private firestore = inject(Firestore);

  private async saveUserProfileToFirestore(uid: string, email: string, nombre: string | null, telefono: string | null): Promise<void> {
    const userProfileRef = doc(this.firestore, 'userProfiles', uid);
    const profileData: { email: string, nombre?: string, telefono?: string } = { email: email };

    if (nombre) {
      profileData.nombre = nombre;
    }
    if (telefono) {
      profileData.telefono = telefono;
    }

    await setDoc(userProfileRef, profileData, { merge: true }); 
    console.log(`Perfil de usuario guardado/actualizado en Firestore para UID: ${uid}`);
  }

  private async getUserProfileFromFirestore(uid: string): Promise<{ nombre?: string, telefono?: string }> {
    const userProfileRef = doc(this.firestore, 'userProfiles', uid);
    const docSnap = await getDoc(userProfileRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`Perfil de usuario obtenido de Firestore para UID: ${uid}`, data);
      return { nombre: data?.['nombre'] || null, telefono: data?.['telefono'] || null };
    } else {
      console.warn(`No se encontró perfil de usuario en Firestore para UID: ${uid}`);
      return {}; 
    }
  }



  register(user: User): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, user.email, user.password)).pipe(
      switchMap(userCredential => {
        const firebaseUser: FirebaseAuthUser = userCredential.user;
        const email = firebaseUser.email || user.email;
        const name = user.nombre || null; 
        const phone = user.telefono || null; 


        return from(this.saveUserProfileToFirestore(firebaseUser.uid, email, name, phone)).pipe(
          switchMap(() => {
        
            return this.auditoriaService.registrarAutenticacion(email!, name, phone, 'REGISTRO_PERSONALIZADO');
          }),
          map(() => userCredential) 
        );
      }),
      catchError(error => {
        console.error("Error en register:", error);
        return from(Promise.reject(error));
      })
    );
  }


  logIn(user: User): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, user.email, user.password)).pipe(
      switchMap(userCredential => {
        const firebaseUser: FirebaseAuthUser = userCredential.user;
        const email = firebaseUser.email || user.email;

        return from(this.getUserProfileFromFirestore(firebaseUser.uid)).pipe(
          switchMap(profile => {
            const name = profile.nombre || firebaseUser.displayName || null;
            const phone = profile.telefono || null; 

            return this.auditoriaService.registrarAutenticacion(email!, name, phone, 'LOGIN_PERSONALIZADO').pipe(
              map(() => userCredential)
            );
          })
        );
      }),
      catchError(error => {
        console.error("Error en logIn:", error);
        return from(Promise.reject(error));
      })
    );
  }

  private processOAuthUserAndAudit(userCredential: UserCredential, method: string): Observable<UserCredential> {
    const firebaseUser: FirebaseAuthUser = userCredential.user;
    const email = firebaseUser.email || (firebaseUser.uid + "@" + method.toLowerCase() + ".com");
    const name = firebaseUser.displayName || null;
    const phone = null;

    return from(this.saveUserProfileToFirestore(firebaseUser.uid, email, name, phone)).pipe( 
      switchMap(() => {
        return this.auditoriaService.registrarAutenticacion(email!, name, phone, method);
      }),
      map(() => userCredential)
    );
  }

  logInGoogle(): Observable<UserCredential> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      switchMap(userCredential => this.processOAuthUserAndAudit(userCredential, 'GOOGLE')),
      catchError(error => {
        console.error("Error en logInGoogle:", error);
        return from(Promise.reject(error));
      })
    );
  }

  logInFacebook(): Observable<UserCredential> {
    return from(signInWithPopup(this.auth, new FacebookAuthProvider())).pipe(
      switchMap(userCredential => this.processOAuthUserAndAudit(userCredential, 'FACEBOOK')),
      catchError(error => {
        console.error("Error en logInFacebook:", error);
        return from(Promise.reject(error));
      })
    );
  }

  logInGitHub(): Observable<UserCredential> {
  return from(signInWithPopup(this.auth, new GithubAuthProvider())).pipe(
    switchMap(userCredential => this.processOAuthUserAndAudit(userCredential, 'GITHUB')),
    catchError(error => {
      console.error("Error detallado en logInGitHub:", {
        code: error.code,
        message: error.message,
        details: error
      });
      return from(Promise.reject(error));
    })
  );
}

  logLogout(): Promise<void> {
    return signOut(this.auth);
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }
}
