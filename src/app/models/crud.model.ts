import { FieldValue, Timestamp } from '@angular/fire/firestore'; 


export interface CrudAuditoria {
  id?: string;
  email: string;
  name?: string; 
  phone?: string | null; 
  metodoAutenticacion: string;
 
  fechaRegistroServidor?: FieldValue | Timestamp;
}
